import {InsightError, InsightDatasetKind} from "../controller/IInsightFacade";
import {QueryHelper} from "../controller/queryHelper";
import {QueryValidator} from "../controller/QueryValidator";

export class TransformationValidator extends QueryValidator {
	private token = ["MAX", "MIN", "COUNT", "AVG", "SUM"];

	constructor(helper: QueryHelper) {
		super(helper);
	}

	public validToken(pair: any): boolean {
		let keys = Object.keys(pair);
		if (keys.length !== 1) {
			return false;
		}

		if (!this.token.includes(keys[0])) {
			return false;
		}

		let key = pair[keys[0]];
		if (typeof key !== "string") {
			return false;
		}

		let lists = key.split("_");
		if (lists.length !== 2 || (!this.sectionKeys.includes(lists[1]) && !this.roomKeys.includes(lists[1]))) {
			return false;
		}
		if (!this.idAndKindChecker(lists, true)) {
			return false;
		}

		if (keys[0] !== "COUNT") {
			if (this.sKeys.includes(lists[1])) {
				return false;
			}
		}
		return true;
	}

	public validApplyRule(rule: any): boolean {
		if (!this.validQuery(rule)) {
			return false;
		}

		let keys = Object.keys(rule);
		if (keys.length !== 1) {
			return false;
		}
		if (
			keys[0] === null ||
			typeof keys[0] !== "string" ||
			keys[0] === "" ||
			keys[0].includes("_") ||
			!keys[0].trim().length
		) {
			return false;
		}

		let pair = rule[keys[0]];
		if (!this.validQuery(pair)) {
			return false;
		}

		if (!this.validToken(pair)) {
			return false;
		}
		return true;
	}

	// NEED TO EDIT THIS
	public validApply(apply: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (!Array.isArray(apply)) {
				return reject(new InsightError("APPLY should be array"));
			}

			let applyList = new Map<string, string[]>();

			for (let each of apply) {
				if (!this.validApplyRule(each)) {
					return reject(new InsightError("each apply rule should be valid"));
				}

				let applyKey = Object.keys(each)[0];
				let token = Object.keys(each[applyKey])[0];
				let pair = each[applyKey][token];

				if (applyList.has(applyKey)) {
					return reject(new InsightError("APPLY Keys not unique"));
				}
				let temp = [];
				temp.push(token);
				temp.push(pair);
				applyList.set(applyKey, temp);
			}
			return fulfill(applyList);
		});
	}

	public validGroup(group: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (!Array.isArray(group)) {
				return reject(new InsightError("group should be array"));
			}
			if (group.length < 1) {
				return reject(new InsightError("group must be a non-empty array"));
			}

			let rtnCols = [];
			for (let g of group) {
				if (typeof g !== "string") {
					return reject(new InsightError("groups should be string"));
				}

				let lists = g.split("_");
				if (lists.length !== 2 || (!this.sectionKeys.includes(lists[1]) && !this.roomKeys.includes(lists[1]))) {
					return reject(new InsightError("invalid groups key"));
				}

				if (!this.idAndKindChecker(lists, true)) {
					return reject(new InsightError("id and kind checker fail"));
				}

				rtnCols.push(g);
			}
			return fulfill(rtnCols);
		});
	}

	public validTrans(trans: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(trans)) {
				return reject(new InsightError("invalid transformations clause"));
			}
			if (Object.keys(trans).length !== 2) {
				return reject(new InsightError("transformations requires 2 keys"));
			}

			let keys = Object.keys(trans);
			if (!keys.includes("GROUP") || !keys.includes("APPLY")) {
				return reject(new InsightError("transformations should contain GROUP and APPLY"));
			}
			return fulfill(trans);
		});
	}
}
