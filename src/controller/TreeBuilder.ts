import {TransformationValidator} from "../controller/TransformationValidator";
import {WhereValidator} from "../controller/WhereValidator";
import {OptionValidator} from "../controller/OptionValidator";
import {AstTree} from "../model/AstTree";
import {QueryHelper} from "../controller/queryHelper";
import {InsightError} from "../controller/IInsightFacade";

export class TreeBuilder {
	private transValidator: TransformationValidator;
	private whereValidator: WhereValidator;
	private optionValidator: OptionValidator;
	private tree: AstTree;
	private helper: QueryHelper;

	constructor(tree: AstTree, helper: QueryHelper) {
		this.helper = helper;
		this.tree = tree;
		this.transValidator = new TransformationValidator(this.helper);
		this.whereValidator = new WhereValidator(this.helper);
		this.optionValidator = new OptionValidator(this.helper);
	}

	public buildFilter(query: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			if (this.tree.getKey() === "NOT") {
				this.whereValidator
					.validNegation(query)
					.then((not: any) => {
						let key = Object.keys(not)[0];
						let tree = new AstTree(key, this.helper);
						tree.buildTree(not[key])
							.then((childTree: AstTree) => {
								this.tree.children.push(tree);
								return fulfill(this.tree);
							})
							.catch((err: any) => {
								return reject(new InsightError("Error building NOT's children node"));
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("NOT clause not valid"));
					});
			} else if (this.tree.getKey() === "IS") {
				this.whereValidator
					.validScomparision(query)
					.then((is: any) => {
						let key = Object.keys(is)[0];
						this.tree.setComparator(key, is[key]);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(new InsightError("IS clause not valid"));
					});
			} else {
				this.whereValidator
					.validLogic(query)
					.then((subQueries: any) => {
						this.tree
							.handleLogic(subQueries)
							.then((tree: AstTree) => {
								return fulfill(this.tree);
							})
							.catch((err: any) => {
								return reject(err);
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("LOGIC clause not valid"));
					});
			}
		});
	}

	public buildTrans(query: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			if (this.tree.getKey() === "TRANSFORMATIONS") {
				// 				console.log("in buildTrans -- TRANSFORMATIONS");
				this.transValidator
					.validTrans(query)
					.then((trans: any) => {
						this.tree
							.handleTrans(trans)
							.then((tree: AstTree) => {
								return fulfill(this.tree);
							})
							.catch((err: any) => {
								return reject(err);
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("TRANSFORMATIONS clause not valid"));
					});
			} else if (this.tree.getKey() === "GROUP") {
				// 				console.log("in buildTrans -- GROUP");
				this.transValidator
					.validGroup(query)
					.then((groups: string[]) => {
						this.tree.setGroups(groups);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(new InsightError("GROUP clause not valid"));
					});
			} else {
				// 				console.log("in buildTrans -- APPLY");
				this.transValidator
					.validApply(query)
					.then((apply: any) => {
						this.tree.setApply(apply);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(new InsightError("APPLY clause not valid"));
					});
			}
		});
	}

	public buildBody(query: any): Promise<AstTree> {
		let k = this.tree.getKey();
		return new Promise((fulfill, reject) => {
			if (k === "WHERE") {
				this.whereValidator
					.validWhere(query)
					.then((where: any) => {
						this.tree
							.handleWhere(where)
							.then((tree: AstTree) => {
								return fulfill(this.tree);
							})
							.catch((err: any) => {
								return reject(err);
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("WHERE clause not valid"));
					});
			} else if (k === "NOT" || k === "IS" || k === "AND" || k === "OR") {
				this.buildFilter(query)
					.then((tree: AstTree) => {
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(err);
					});
			} else {
				this.whereValidator
					.validMcomparision(query)
					.then((comp: any) => {
						let key = Object.keys(comp)[0];
						let numberVal = comp[key];
						this.tree.setComparator(key, numberVal);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(new InsightError("mComparators clause not valid"));
					});
			}
		});
	}

	public buildOptions(query: any): Promise<AstTree> {
		return new Promise((fulfill, reject) => {
			if (this.tree.getKey() === "OPTIONS") {
				this.optionValidator
					.validOptions(query)
					.then((option: any) => {
						this.tree
							.handleOptions(option)
							.then((tree: AstTree) => {
								return fulfill(this.tree);
							})
							.catch((err: any) => {
								return reject(err);
							});
					})
					.catch((err: any) => {
						return reject(new InsightError("OPTIONS clause not valid"));
					});
			} else if (this.tree.getKey() === "COLUMNS") {
				this.optionValidator
					.validColumns(query)
					.then((cols: string[]) => {
						this.tree.setCols(cols);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						return reject(err);
					});
			} else {
				this.optionValidator
					.validOrder(query)
					.then((order: any) => {
						this.tree.setDir(order[0]);
						this.tree.setOrder(order[1]);
						return fulfill(this.tree);
					})
					.catch((err: any) => {
						// 						console.log("error in build order");
						return reject(new InsightError("ORDER clause not valid"));
					});
			}
		});
	}
}
