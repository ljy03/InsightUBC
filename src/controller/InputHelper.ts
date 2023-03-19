import {IInsightFacade, InsightDatasetKind, InsightError} from "./IInsightFacade";

import InsightFacade from "./InsightFacade";
import {Section} from "../model/Section";
import {SectionDataset} from "../model/SectionDataset";
import JSZip from "jszip";
import * as fs from "fs-extra";

export class InputHelper {
	private referenceFacade: InsightFacade;

	constructor(facade: InsightFacade) {
		this.referenceFacade = facade;
	}

	public checkIdValid(id: string): boolean {
		if (id === null || typeof id !== "string" || id === "" || id.includes("_") || !id.trim().length) {
			return false;
		}
		return true;
	}

	public checkIdExist(id: string): boolean {
		for (let elem of this.referenceFacade.getIdList()) {
			if (elem === id) {
				return true;
			}
		}
		let path = "data/" + id + ".json";
		if (fs.existsSync(path)) {
			return true;
		}

		return false;
	}

	private createSection(data: any): Promise<any> {
		return new Promise((fulfill) => {
			try {
				if (this.checkDataFormat(data)) {
					let section = new Section();
					let year = Number(data.Year);
					if (data.Section === "overall") {
						year = 1900;
					}
					section.set(
						data.id.toString(),
						data.Course,
						data.Title,
						data.Professor,
						data.Subject,
						year,
						data.Avg,
						data.Pass,
						data.Fail,
						data.Audit
					);

					return fulfill(section);
				} else {
					return fulfill(null);
				}
			} catch (err: any) {
				return fulfill(null);
			}
		});
	}

	private parseFile(file: string): Promise<Section[]> {
		return new Promise((fulfill, reject) => {
			try {
				let returnSections: Section[] = [];
				let parseJson = JSON.parse(file)["result"];
				let listPromise: Array<Promise<any>> = [];
				parseJson.forEach((data: any) => {
					listPromise.push(this.createSection(data));

					// 					try {
					// 						if (this.checkDataFormat(data)) {
					// 							let section = new Section();
					// 							let year = Number(data.Year);
					// 							if (data.Section === "overall") {
					// 								year = 1900;
					// 							}
					// 							section.set(
					// 								data.id.toString(),
					// 								data.Course,
					// 								data.Title,
					// 								data.Professor,
					// 								data.Subject,
					// 								year,
					// 								data.Avg,
					// 								data.Pass,
					// 								data.Fail,
					// 								data.Audit
					// 							);
					//
					// 							returnSections.push(section);
					// 						}
					// 						// console.log(listSections.length);
					// 					} catch (err) {
					// 						return reject(new InsightError("failed to creation section object"));
					// 					}
				});
				Promise.all(listPromise)
					.then((sections: any) => {
						for (let sec of sections) {
							if (sec !== null) {
								returnSections.push(sec);
							}
						}
						return fulfill(returnSections);
					})
					.catch((err: any) => {
						return reject(new InsightError("failed to creation section object"));
					});
			} catch (err) {
				return reject(new InsightError("fail parsing each JSON file result"));
			}
		});
	}

	private checkDataFormat(data: any): boolean {
		let keys = Object.keys(data);
		if (
			!keys.includes("id") ||
			!keys.includes("Course") ||
			!keys.includes("Title") ||
			!keys.includes("Professor") ||
			!keys.includes("Subject") ||
			!keys.includes("Year") ||
			!keys.includes("Avg") ||
			!keys.includes("Pass") ||
			!keys.includes("Fail") ||
			!keys.includes("Audit")
		) {
			return false;
		}
		let year = Number(data.Year);
		if (year * 1 !== year) {
			return false;
		}

		if (typeof data.id !== "string" && typeof data.id !== "number") {
			return false;
		}

		let check =
			typeof data.Course === "string" &&
			typeof data.Title === "string" &&
			typeof data.Professor === "string" &&
			typeof data.Subject === "string" &&
			typeof Number(data.Year) === "number" &&
			typeof data.Avg === "number" &&
			typeof data.Pass === "number" &&
			typeof data.Fail === "number" &&
			typeof data.Audit === "number";

		return check;
	}

	private saveJSONFile(id: string, dataset: SectionDataset): Promise<any> {
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

	private updateDatasetLists(id: string, kind: InsightDatasetKind, list: Section[]): SectionDataset {
		let numRows = list.length;
		let sectionData = new SectionDataset(id, numRows, kind);
		sectionData.setSectionList(list);
		this.referenceFacade.addDatasetMap(id, sectionData);
		this.referenceFacade.addId(id);
		return sectionData;
	}

	private handleParsedSections(id: string, parsePromises: Array<Promise<any>>): Promise<string[]> {
		let listSections: Section[] = [];
		return new Promise((fulfill, reject) => {
			Promise.all(parsePromises)
				.then((listList: Section[][]) => {
					for (let secList of listList) {
						for (let sec of secList) {
							listSections.push(sec);
						}
					}
					if (listSections.length === 0) {
						return reject(new InsightError("no valid section present"));
					}
					let kind = InsightDatasetKind.Sections;
					let sectionData = this.updateDatasetLists(id, kind, listSections);

					this.saveJSONFile(id, sectionData)
						.then(() => {
							return fulfill(this.referenceFacade.getIdList());
						})
						.catch((err) => {
							return reject(new InsightError("failed saving JSON data file"));
						});
				})
				.catch((err) => {
					return reject(new InsightError("error adding"));
				});
		});
	}

	private handleAllFiles(id: string, listPromise: Array<Promise<any>>): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			Promise.all(listPromise)
				.then((fileData: string[]) => {
					if (fileData.length === 0) {
						return reject(new InsightError("empty course folder or course folder not exist"));
					}
					let parsePromises: Array<Promise<any>> = [];
					for (let elem of fileData) {
						parsePromises.push(this.parseFile(elem));
					}

					this.handleParsedSections(id, parsePromises)
						.then((result: string[]) => {
							return fulfill(result);
						})
						.catch((err) => {
							return reject(new InsightError("error handle parsed section list promise"));
						});
				})
				.catch((err) => {
					return reject(new InsightError("error stringify files"));
				});
		});
	}

	private handleZipFile(id: string, content: string): Promise<string[]> {
		let zipFile = new JSZip();
		let listPromise: Array<Promise<any>> = [];

		return new Promise((fulfill, reject) => {
			zipFile
				.loadAsync(content, {base64: true})
				.then((zip: any) => {
					zip.folder("courses").forEach((relativePath: string, file: any) => {
						listPromise.push(file.async("string"));
					});

					this.handleAllFiles(id, listPromise)
						.then((result: string[]) => {
							return fulfill(result);
						})
						.catch((err) => {
							return reject(new InsightError("error in handle All string Files"));
						});
				})
				.catch((err) => {
					return reject(new InsightError("error first step extracting content from zip file"));
				});
		});
	}

	public addSectionContent(id: string, content: string): Promise<string[]> {
		let listSections: Section[] = [];

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
}
