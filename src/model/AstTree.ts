import {InsightError} from "../controller/IInsightFacade";
import {QueryHelper} from "../controller/queryHelper";
import {TreeBuilder} from "../controller/TreeBuilder";

export class AstTree {
	private key: string;
	public children: AstTree[] = [];
	private bodyKeys = ["WHERE", "AND", "OR", "IS", "NOT", "GT", "LT", "EQ"];
	private transKeys = ["TRANSFORMATIONS", "GROUP", "APPLY"];
	private optionKeys = ["OPTIONS", "COLUMNS", "ORDER"];
	private mComparators = ["LT", "GT", "EQ"];
	private comparatorMatch: Map<string, any> = new Map<string, any>();
	private cols: string[] = [];
	private groups: string[] = [];
	private apply: Map<string, string[]> = new Map<string, string[]>();
	private order: string[] = [];
	private dir: string = "";
	private helper: QueryHelper;
	private builder: TreeBuilder;

	constructor(key: string, helper: QueryHelper) {
		this.key = key;
		this.helper = helper;
		this.builder = new TreeBuilder(this, this.helper);
	}

	public handleWhere(where: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			if (where === "") {
				return fulfill(this);
			}
			let whereKeys = Object.keys(where);

			let listPromise: Array<Promise<any>> = [];

			for (let key of whereKeys) {
				let child = new AstTree(key, this.helper);
				listPromise.push(child.buildTree(where[key]));
			}
			Promise.all(listPromise)
				.then((builtChild: AstTree[]) => {
					for (let each of builtChild) {
						this.children.push(each);
					}
					return fulfill(this);
				})
				.catch((err: any) => {
					return reject(new InsightError("Error building WHERE's children nodes"));
				});
		});
	}

	public handleTrans(trans: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			let transKeys = Object.keys(trans);
			let listPromise: Array<Promise<any>> = [];

			for (let key of transKeys) {
				let child = new AstTree(key, this.helper);
				listPromise.push(child.buildTree(trans[key]));
			}

			Promise.all(listPromise)
				.then((builtChild: AstTree[]) => {
					for (let each of builtChild) {
						this.children.push(each);
					}
					return fulfill(this);
				})
				.catch((err: any) => {
					return reject(new InsightError("Error building TRANSFORMATIONS children nodes"));
				});
		});
	}

	public handleOptions(option: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			let optionKeys = Object.keys(option);
			let listPromise: Array<Promise<any>> = [];

			for (let key of optionKeys) {
				let child = new AstTree(key, this.helper);
				listPromise.push(child.buildTree(option[key]));
			}

			Promise.all(listPromise)
				.then((builtChild: AstTree[]) => {
					for (let each of builtChild) {
						this.children.push(each);
					}
					return fulfill(this);
				})
				.catch((err: any) => {
					// 					console.log("error in handle Options");
					return reject(new InsightError("Error building OPTIONS's children nodes"));
				});
		});
	}

	public handleLogic(subQueries: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			let listPromise: Array<Promise<any>> = [];
			for (let q of subQueries) {
				let key = Object.keys(q)[0];
				let child = new AstTree(key, this.helper);
				listPromise.push(child.buildTree(q[key]));
			}

			Promise.all(listPromise)
				.then((builtChild: AstTree[]) => {
					for (let each of builtChild) {
						this.children.push(each);
					}
					return fulfill(this);
				})
				.catch((err: any) => {
					return reject(new InsightError("Error building LOGIC's children nodes"));
				});
		});
	}

	public buildTree(query: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			if (this.bodyKeys.includes(this.key)) {
				this.builder
					.buildBody(query)
					.then((tree: AstTree) => {
						return fulfill(this);
					})
					.catch((err: any) => {
						return reject(new InsightError("WHERE clause not valid"));
					});
			} else if (this.transKeys.includes(this.key)) {
				this.builder
					.buildTrans(query)
					.then((tree: AstTree) => {
						return fulfill(this);
					})
					.catch((err: any) => {
						return reject(new InsightError("TRANS clause not valid"));
					});
			} else if (this.optionKeys.includes(this.key)) {
				this.builder
					.buildOptions(query)
					.then((tree: AstTree) => {
						return fulfill(this);
					})
					.catch((err: any) => {
						return reject(new InsightError("Options clause not valid"));
					});
			} else {
				return reject(new InsightError("invalid EBNF key"));
			}
		});
	}

	public addChild(child: AstTree) {
		this.children.push(child);
	}

	public getKey(): string {
		return this.key;
	}

	public getChild(): AstTree[] {
		return this.children;
	}

	public getComparator(): Map<string, any> {
		return this.comparatorMatch;
	}

	public setComparator(key: string, val: any) {
		this.comparatorMatch.set(key, val);
	}

	public getCols(): string[] {
		return this.cols;
	}

	public setCols(cols: string[]) {
		this.cols = cols;
	}

	public getOrder(): string[] {
		return this.order;
	}

	public setOrder(order: string[]) {
		this.order = order;
	}

	public getGroups(): string[] {
		return this.groups;
	}

	public setGroups(groups: string[]) {
		this.groups = groups;
	}

	public getApply(): Map<string, string[]> {
		return this.apply;
	}

	public setApply(apply: Map<string, string[]>) {
		this.apply = apply;
	}

	public getDir(): string {
		return this.dir;
	}

	public setDir(dir: string) {
		this.dir = dir;
	}
}
