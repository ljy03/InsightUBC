import {IInsightFacade, InsightDatasetKind, InsightError} from "./IInsightFacade";

import InsightFacade from "./InsightFacade";
import {Room} from "../model/Room";
import {Building} from "../model/Building";
import {RoomDataset} from "../model/RoomDataset";
import {BuildingHelper} from "./BuildingHelper";
import JSZip from "jszip";
import * as fs from "fs-extra";
import * as parser from "parse5";

export class RoomInputHelper {
	private referenceFacade: InsightFacade;
	private buildingHelper: BuildingHelper;

	constructor(facade: InsightFacade) {
		this.referenceFacade = facade;
		this.buildingHelper = new BuildingHelper();
	}

	private validNode(node: any): boolean {
		// 		if (node === undefined) {
		// 			console.log("node undefined");
		// 		}
		return !(node === null || node === undefined);
	}

	private findRoomFromTable(table: any, building: Building): any[] {
		let rtn = [];

		for (let node of table.childNodes) {
			if (this.validNode(node) && node.nodeName === "tbody") {
				for (let row of node.childNodes) {
					if (this.validNode(row) && row.nodeName === "tr") {
						let cols = row.childNodes;
						if (this.validNode(cols)) {
							let room = new Room();
							for (let td of cols) {
								if (this.validNode(td) && td.nodeName === "td" && td.attrs[0].name === "class") {
									if (td.attrs[0].value === "views-field views-field-field-room-number") {
										room.number = td.childNodes[1].childNodes[0].value.trim();
										room.fieldCounter++;
									} else if (td.attrs[0].value === "views-field views-field-field-room-capacity") {
										room.seats = Number(td.childNodes[0].value.trim());
										room.fieldCounter++;
									} else if (td.attrs[0].value === "views-field views-field-field-room-furniture") {
										room.furniture = td.childNodes[0].value.trim();
										room.fieldCounter++;
									} else if (td.attrs[0].value === "views-field views-field-field-room-type") {
										room.type = td.childNodes[0].value.trim();
										room.fieldCounter++;
									} else if (td.attrs[0].value === "views-field views-field-nothing") {
										room.href = td.childNodes[1].attrs[0].value.trim();
										room.fieldCounter++;
									}
								}
							}
							if (room.fieldCounter === 5) {
								room.address = building.address;
								room.lat = building.lat;
								room.lon = building.lon;
								room.fullname = building.fullname;
								room.shortname = building.shortname;
								room.name = building.shortname + "_" + room.number;
								rtn.push(room);
							}
						}
					}
				}
			}
		}
		return rtn;
	}

	private findRooms(tree: any, building: Building): any[] {
		let rtn = [];
		let listNode = tree.childNodes;

		if (this.validNode(listNode)) {
			for (let node of listNode) {
				if (this.validNode(node) && node.nodeName === "table") {
					rtn = this.findRoomFromTable(node, building);
					if (rtn.length !== 0) {
						return rtn;
					}
				} else {
					rtn = this.findRooms(node, building);
					if (rtn.length !== 0) {
						return rtn;
					}
				}
			}
		}
		return rtn;
	}

	private saveJSONFile(id: string, dataset: RoomDataset): Promise<any> {
		return new Promise((fulfill, reject) => {
			let path = "data/" + id + ".json";
			let JSONData = JSON.stringify(dataset, null, 4);
			fs.outputFile(path, JSONData)
				.then(() => {
					return fulfill("successfully saved");
				})
				.catch((err: any) => {
					return reject(new InsightError("error saving data file"));
				});
		});
	}

	public addRoomContent(id: string, content: string): Promise<string[]> {
		let listRooms: Room[] = [];

		return new Promise((fulfill, reject) => {
			if (content === null || typeof content !== "string") {
				return reject(new InsightError("invalid content input"));
			}

			this.handleZipFile(id, content)
				.then((response: string[]) => {
					return fulfill(response);
				})
				.catch((err) => {
					return reject(new InsightError("error handling zip file"));
				});
		});
	}

	private asyncGetRooms(file: any, building: Building): Promise<any[]> {
		return new Promise((fulfill, reject) => {
			file.async("text")
				.then((index: any) => {
					// 					let parser = require("parse5");
					let htm = parser.parse(index);
					return fulfill(this.findRooms(htm, building));
				})
				.catch((err: any) => {
					// something
					return reject(new InsightError());
				});
		});
	}

	private getListRooms(building: Building, content: string): Promise<Room[]> {
		let link = building.href;
		let addr = link.split("/").slice(-1)[0];
		let zipJS = new JSZip();
		return new Promise((fulfill, reject) => {
			zipJS
				.loadAsync(content, {base64: true})
				.then((zip: any) => {
					let listPromise: Array<Promise<any>> = [];
					let count = 0;
					zip.folder("campus")
						.folder("discover")
						.folder("buildings-and-classrooms")
						.forEach((relativePath: string, file: any) => {
							// 							console.log(count++);
							let name = file.name.split("/").slice(-1)[0];
							if (name === addr) {
								listPromise.push(this.asyncGetRooms(file, building));
							}
						});

					Promise.all(listPromise)
						.then((rooms: any) => {
							if (listPromise.length === 0) {
								return fulfill([]);
							}
							return fulfill(rooms[0]);
						})
						.catch((err: any) => {
							return reject(new InsightError());
						});
				})
				.catch((err: any) => {
					// something
					// 					console.log(err);
					return reject(new InsightError());
				});
		});
	}

	private finalizeRooms(id: string, listPromise: Array<Promise<any>>): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			Promise.all(listPromise)
				.then((lists: any) => {
					let rooms = [];
					for (let list of lists) {
						for (let each of list) {
							rooms.push(each);
						}
					}
					let numRows = rooms.length;

					if (numRows === 0) {
						return reject(new InsightError("failed with zero valid room"));
					}

					let dataset = new RoomDataset(id, numRows, InsightDatasetKind.Rooms);
					dataset.setRoomList(rooms);
					this.referenceFacade.addDatasetMap(id, dataset);
					this.referenceFacade.addId(id);

					this.saveJSONFile(id, dataset)
						.then(() => {
							return fulfill(this.referenceFacade.getIdList());
						})
						.catch((err) => {
							return reject(new InsightError("failed saving JSON data file"));
						});
				})
				.catch((err) => {
					// something
					return reject(new InsightError());
				});
		});
	}

	private handleBuildingFile(id: string, content: string, zip: any): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			zip.file("index.htm")
				.async("text")
				.then((index: any) => {
					// 					console.log("in handle Building File");
					let htm = parser.parse(index);
					let buildings = this.buildingHelper.findBuildings(htm);
					let promises: Array<Promise<any>> = [];

					for (let building of buildings) {
						promises.push(this.buildingHelper.geolocation(building));
					}

					Promise.all(promises)
						.then((listBuilding) => {
							let listPromise: Array<Promise<any>> = [];
							for (let building of listBuilding) {
								if (building.hasGeo) {
									listPromise.push(this.getListRooms(building, content));
								}
							}
							return fulfill(this.finalizeRooms(id, listPromise));
						})
						.catch((err: any) => {
							return reject(new InsightError("error in either getListRooms/ finalizeRooms"));
						});
				})
				.catch((err: any) => {
					return reject(new InsightError("error in getting index file"));
				});
		});
	}

	private handleZipFile(id: string, content: string): Promise<string[]> {
		let zipFile = new JSZip();

		return new Promise((fulfill, reject) => {
			zipFile
				.loadAsync(content, {base64: true})
				.then((zip: any) => {
					this.handleBuildingFile(id, content, zip)
						.then((result: string[]) => {
							return fulfill(result);
						})
						.catch((err: any) => {
							return reject(new InsightError("failed handleBuildingFile"));
						});
				})
				.catch((err: any) => {
					// something
					return reject(new InsightError("failed handleZipFile"));
				});
		});
	}
}
