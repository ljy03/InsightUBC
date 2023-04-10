import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import {InputHelper} from "./InputHelper";
import {RoomInputHelper} from "./RoomInputHelper";
import {SectionDataset} from "../model/SectionDataset";
import {RoomDataset} from "../model/RoomDataset";
import {Section} from "../model/Section";
import {Room} from "../model/Room";
import {QueryHelper} from "./queryHelper";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private IdList: string[] = [];
	public datasets: Map<string, any> = new Map<string, any>();
	private helper: InputHelper;
	private roomHelper: RoomInputHelper;

	constructor() {
		// console.log("InsightFacadeImpl::init()");
		this.helper = new InputHelper(this);
		this.roomHelper = new RoomInputHelper(this);
		this.setup();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// first screening the input
		return new Promise((fulfill, reject) => {
			if (!this.helper.checkIdValid(id)) {
				return reject(new InsightError("Invalid input Id"));
			}

			if (this.helper.checkIdExist(id)) {
				return reject(new InsightError("cannot add dataset with same id twice"));
			}

			if (kind !== InsightDatasetKind.Sections && kind !== InsightDatasetKind.Rooms) {
				return reject(new InsightError("invalid InsightDatasetKind"));
			}

			if (kind === InsightDatasetKind.Sections) {
				this.helper
					.addSectionContent(id, content)
					.then((result) => {
						return fulfill(result);
					})
					.catch((err) => {
						return reject(new InsightError("error adding sections dataset"));
					});
			} else {
				// 				console.log("in InsightFacade");
				this.roomHelper
					.addRoomContent(id, content)
					.then((result: any) => {
						return fulfill(result);
					})
					.catch((err: any) => {
						return reject(new InsightError("error adding rooms dataset"));
					});
			}
		});
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise((fulfill, reject) => {
			if (!this.helper.checkIdValid(id)) {
				return reject(new InsightError("Invalid input Id"));
			}

			// console.log(this.helper.checkIdExist(id));
			if (!this.helper.checkIdExist(id)) {
				return reject(new NotFoundError("Id does not exist"));
			}

			let newList: string[] = [];
			this.IdList.forEach((element, index) => {
				if (element !== id) {
					newList.push(element);
				}
				this.IdList = newList;
			});

			this.datasets.delete(id);

			let path = "data/" + id + ".json";
			fs.remove(path, (err: any) => {
				if (err) {
					return reject("fail deleting the JSON file");
				}
			});

			return fulfill(id);
		});
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return new Promise((fulfill, reject) => {
			let result: InsightResult[] = [];
			let jQuery = query;
			let qHelper = new QueryHelper(this);

			qHelper
				.buildAST(jQuery)
				.then(() => {
					if (!this.IdList.includes(qHelper.getID())) {
						return reject(new InsightError("dataset not found"));
					}
				})
				.then(() => {
					let set = this.datasets.get(qHelper.getID());
					if (set === undefined) {
						return reject(new InsightError("dataset is undefined in map"));
					}
					qHelper
						.queryRecursion(jQuery, set)
						.then((res: any[]) => {
							// something
							// 							console.log("queryRecursion work");
							for (let each of res) {
								let a: InsightResult = {};
								for (let [k, v] of each) {
									a[k] = v;
								}
								result.push(a);
							}
							if (result.length > 5000) {
								return reject(new ResultTooLargeError("result too large"));
							}
							return fulfill(result);
						})
						.catch((err: any) => {
							return reject(err);
						});
				})
				.catch((err: any) => {
					return reject(err);
				});
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let list: InsightDataset[] = [];
		return new Promise((fulfill) => {
			if (this.IdList.length === 0) {
				return fulfill([]);
			}
			for (let key of this.IdList) {
				let keyPair = this.datasets.get(key);
				if (keyPair === undefined) {
					return fulfill([]);
				}
				let iDataset = keyPair.getInsightDataset();
				list.push(iDataset);
			}

			return fulfill(list);
		});
	}

	public loadSections(obj: any) {
		let newDataset = new SectionDataset(obj.insightDataset.id, obj.insightDataset.numRows, obj.insightDataset.kind);
		let secList = [];
		for (let each of obj.sectionList) {
			let sec = new Section();
			sec.set(
				each.uuid,
				each.id,
				each.title,
				each.instructor,
				each.dept,
				each.year,
				each.avg,
				each.pass,
				each.fail,
				each.audit
			);
			secList.push(sec);
		}
		newDataset.setSectionList(secList);
		this.datasets.set(obj.insightDataset.id, newDataset);
	}

	public loadRooms(obj: any) {
		let newDataset = new RoomDataset(obj.insightDataset.id, obj.insightDataset.numRows, obj.insightDataset.kind);
		let roomList = [];
		for (let each of obj.roomList) {
			let room = new Room();
			room.set(
				each.fullname,
				each.shortname,
				each.number,
				each.name,
				each.address,
				each.lat,
				each.lon,
				each.seats,
				each.type,
				each.furniture,
				each.href
			);
			roomList.push(room);
		}
		newDataset.setRoomList(roomList);
		this.datasets.set(obj.insightDataset.id, newDataset);
	}

	public loadAllDisk() {
		// 		console.log("in loadAllDisk");
		let loadedMap: Map<string, SectionDataset> = new Map<string, SectionDataset>();
		const loadFolder = "./data/";

		fs.readdirSync(loadFolder).forEach((file: any) => {
			let path = "data/" + file;
			let obj = fs.readJsonSync(path);
			this.IdList.push(obj.insightDataset.id);
			// 			console.log(this.IdList);
			if (obj.insightDataset.kind === InsightDatasetKind.Sections) {
				this.loadSections(obj);
			} else {
				this.loadRooms(obj);
			}
		});
	}

	public setup() {
		try {
			this.loadAllDisk();
		} catch (error) {
			// 			console.log("some error loading from disk");
		}
	}

	public getIdList(): string[] {
		return this.IdList;
	}

	public addId(id: string) {
		this.IdList.push(id);
	}

	public addDatasetMap(id: string, data: any) {
		this.datasets.set(id, data);
	}
}
