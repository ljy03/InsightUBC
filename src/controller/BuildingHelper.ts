import {Building} from "../model/Building";
import * as http from "http";

export class BuildingHelper {
	constructor() {
		// nothing here
	}

	private validNode(node: any): boolean {
		return !(node === null || node === undefined);
	}

	public geolocation(building: Building): Promise<Building> {
		return new Promise((fulfill, reject) => {
			let address = building.address;
			let link = encodeURI(address);

			let URL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team157/" + link;
			http.get(URL, (res: any) => {
				let body: any[] = [];
				res.on("data", (chunk: any) => {
					body.push(chunk);
				});
				res.on("end", () => {
					try {
						let result = JSON.parse(Buffer.concat(body).toString());
						if (result.error) {
							return fulfill(building);
						} else {
							building.lat = result.lat;
							building.lon = result.lon;
							building.hasGeo = true;
							return fulfill(building);
						}
					} catch (err) {
						return fulfill(building);
					}
				});
			});
		});
	}

	public findFromTable(table: any): any[] {
		let rtn = [];

		for (let node of table.childNodes) {
			if (this.validNode(node) && node.nodeName === "tbody") {
				for (let row of node.childNodes) {
					if (this.validNode(row) && row.nodeName === "tr") {
						let cols = row.childNodes;
						if (this.validNode(cols)) {
							let building = new Building();
							for (let td of cols) {
								if (this.validNode(td) && td.nodeName === "td" && td.attrs[0].name === "class") {
									if (td.attrs[0].value === "views-field views-field-field-building-code") {
										building.shortname = td.childNodes[0].value.trim();
										building.fieldCounter++;
									}
									if (td.attrs[0].value === "views-field views-field-field-building-address") {
										building.address = td.childNodes[0].value.trim();
										building.fieldCounter++;
									}

									if (td.attrs[0].value === "views-field views-field-title") {
										building.fullname = td.childNodes[1].childNodes[0].value.trim();
										building.href = td.childNodes[1].attrs[0].value.trim();
										building.fieldCounter = building.fieldCounter + 2;
									}
								}
							}
							if (building.fieldCounter === 4) {
								rtn.push(building);
							}
						}
					}
				}
			}
		}
		return rtn;
	}

	public findBuildings(tree: any): any[] {
		let rtn = [];
		let listNode = tree.childNodes;

		if (this.validNode(listNode)) {
			for (let node of listNode) {
				if (this.validNode(node) && node.nodeName === "table") {
					rtn = this.findFromTable(node);
					if (rtn.length !== 0) {
						return rtn;
					}
				} else {
					rtn = this.findBuildings(node);
					if (rtn.length !== 0) {
						return rtn;
					}
				}
			}
		}
		return rtn;
	}
}
