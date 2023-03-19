import {IInsightFacade, InsightDatasetKind, InsightError, ResultTooLargeError} from "./IInsightFacade";

import InsightFacade from "./InsightFacade";
import {Section} from "../model/Section";
import {SectionDataset} from "../model/SectionDataset";
import {RoomDataset} from "../model/RoomDataset";
import {AstTree} from "../model/AstTree";
import {Group} from "../model/Group";
import {Utils} from "./Utils";
import * as fs from "fs-extra";

export class QueryHelper {
	private astTree: AstTree = new AstTree("top", this);
	private facade: InsightFacade;
	private id: string = "";
	private where: AstTree = new AstTree("WHERE", this);
	private option: AstTree = new AstTree("OPTIONS", this);
	private transformation: AstTree = new AstTree("TRANSFORMATIONS", this);
	private hasTrans: boolean = false;
	private util: Utils = new Utils();

	constructor(facade: InsightFacade) {
		this.facade = facade;
	}

	public buildAST(query: any): Promise<AstTree> {
		// 		console.log("in buildAST");
		return new Promise((fulfill, reject) => {
			if (!this.util.validateQuery(query)) {
				return reject(new InsightError("invalid EBNF structure"));
			}

			let listPromise: Array<Promise<any>> = [];
			listPromise.push(this.where.buildTree(query["WHERE"]));
			if (Object.keys(query).length === 3) {
				this.hasTrans = true;
				listPromise.push(this.transformation.buildTree(query["TRANSFORMATIONS"]));
			}
			listPromise.push(this.option.buildTree(query["OPTIONS"]));

			Promise.all(listPromise)
				.then((builtChild: AstTree[]) => {
					for (let each of builtChild) {
						this.astTree.addChild(each);
					}
					return fulfill(this.astTree);
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	public setID(id: string) {
		this.id = id;
	}

	public getKind(id: string): InsightDatasetKind {
		return this.facade.datasets.get(id).getInsightDatasetKind();
	}

	public checkID(id: string): boolean {
		if (this.id === "") {
			if (!this.dataIdExist(id)) {
				return false;
			}
			this.setID(id);
			return true;
		}
		return id === this.id;
	}

	public dataIdExist(id: string): boolean {
		return this.facade.getIdList().includes(id);
	}

	public queryTransOpt(lists: any[]): Promise<any[]> {
		return new Promise((fulfill, reject) => {
			this.transRecursion(this.transformation, lists)
				.then((list: any[]) => {
					this.optionRecursion(this.option, list)
						.then((res: any[]) => {
							return fulfill(res);
						})
						.catch((err: any) => {
							return reject(new InsightError("fail query from OPTIONS"));
						});
				})
				.catch((err: any) => {
					return reject(new InsightError("fail query from trans"));
				});
		});
	}

	public queryRecursion(query: any, dataset: SectionDataset | RoomDataset): Promise<any[]> {
		let data = this.util.getAll(dataset);
		let rtn: any[] = [];
		return new Promise((fulfill, reject) => {
			if (this.astTree.getKey() === "top") {
				this.bodyRecursion(this.where, data)
					.then((lists: any[]) => {
						this.queryTransOpt(lists)
							.then((res: any) => {
								return fulfill(res);
							})
							.catch((err: any) => {
								return reject(new InsightError("error in queryTransOpt"));
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("fail query from BODY"));
					});
			} else {
				return reject(new InsightError("top key of tree assignment error"));
			}
		});
	}

	public bodyRecursion(tree: AstTree, dataset: any[]): Promise<any[]> {
		let rtn = dataset;
		let listPromise: Array<Promise<any[]>> = [];
		return new Promise((fulfill, reject) => {
			let key: string = tree.getKey();
			if (key === "WHERE") {
				if (tree.getChild().length === 0) {
					return fulfill(rtn);
				}
				this.bodyRecursion(tree.getChild()[0], dataset)
					.then((res: any[]) => {
						return fulfill(res);
					}).catch((err: any) => {
						return reject(new InsightError("error running body recursion"));
					});
			} else if (key === "OR" || key === "AND") {
				for (let each of tree.getChild()) {
					listPromise.push(this.bodyRecursion(each, dataset));
				}
				Promise.all(listPromise)
					.then((listRes: any[][]) => {
						if (key === "OR") {
							rtn = [];
							for (let res of listRes) {
								rtn = this.util.union(rtn, res);
							}
						} else {
							for (let res of listRes) {
								rtn = this.util.intersect(rtn, res);
							}
						}
						return fulfill(rtn);
					}).catch((err: any) => {
						return reject(new InsightError("error running body OR recursion"));
					});
			} else if (key === "NOT") {
				this.bodyRecursion(tree.getChild()[0], dataset)
					.then((res: any[]) => {
						return fulfill(this.util.minus(rtn, res));
					}).catch((err: any) => {
						return reject(new InsightError("error running body NOT recursion"));
					});
			} else if (key === "IS" || key === "LT" || key === "GT" || key === "EQ") {
				rtn = this.util.comparatorMatch(key, tree.getComparator(), rtn);
				return fulfill(rtn);
			} else {
				return reject(new InsightError("invalid body key found"));
			}
		});
	}

	public createGroup(groups: string[], index: number, data: Group): any {
		if (index === groups.length) {
			return [data];
		}

		let rtn: Group[] = [];
		let group = groups[index];
		let map: Map<string, any> = new Map<string, any>();
		for (let d of data.list) {
			let s = group.split("_")[1];
			let value = d.get(s);
			if (map.get(value)) {
				map.get(value).push(d);
			} else {
				map.set(value, [d]);
			}
		}

		for (let [k, v] of map) {
			let temp = new Group();
			temp.setLabel(data.label);
			temp.label.set(group, k);
			temp.list = v;
			let intermediate = this.createGroup(groups, index + 1, temp);
			for (let each of intermediate) {
				rtn.push(each);
			}
		}

		return rtn;
	}

	public transRecursion(tree: AstTree, dataset: any[]): Promise<any[]> {
		let result: Group[] = [];
		let groupData: Group[] = [];

		return new Promise((fulfill, reject) => {
			if (!this.hasTrans) {
				return fulfill(dataset);
			}

			for (let child of tree.getChild()) {
				if (child.getKey() === "GROUP") {
					let groups = child.getGroups();
					let group = new Group();
					group.list = dataset;
					groupData = this.createGroup(groups, 0, group);
				}
			}

			for (let child of tree.getChild()) {
				if (child.getKey() === "APPLY") {
					let rules = child.getApply();
					for (let group of groupData) {
						let g = new Group();
						g.qLabel = group.label;
						let datas = group.list;
						for (let [k, v] of rules) {
							let val = this.util.calcRule(datas, v);
							g.qLabel.set(k, val);
						}
						result.push(g);
					}
				}
			}

			return fulfill(result);
		});
	}

	public optionRecursion(tree: AstTree, list: any[]): Promise<any[]> {
		let result: any[] = [];
		let filters: string[] = [];
		return new Promise((fulfill, reject) => {
			for (let child of tree.getChild()) {
				if (child.getKey() === "COLUMNS") {
					filters = child.getCols();
					if (this.hasTrans) {
						for (let each of list) {
							let temp: Map<string, any> = new Map<string, any>();
							for (let filter of filters) {
								if (each.qLabel.get(filter) !== null && each.qLabel.get(filter) !== undefined) {
									temp.set(filter, each.qLabel.get(filter));
								} else {
									return reject(new InsightError("cols keys should in transformation"));
								}
							}
							result.push(temp);
						}
					} else {
						for (let each of list) {
							let temp: Map<string, any> = new Map<string, any>();
							for (let filter of filters) {
								let check = filter.split("_");
								if (check.length === 1) {
									return reject(new InsightError("without transformation col key not valid"));
								}
								let value = each.get(check[1]);
								temp.set(filter, value);
							}
							result.push(temp);
						}
					}
				}
			}
			for (let child of tree.getChild()) {
				if (child.getKey() === "ORDER") {
					let order = child.getOrder();
					let dir = child.getDir();
					for (let o of order) {
						if (!filters.includes(o)) {
							return reject(new InsightError("order key should be in columns"));
						}
					}
					result = this.util.sortHelper(result, order, dir);
				}
			}
			return fulfill(result);
		});
	}

	public getID(): string {
		return this.id;
	}
}
