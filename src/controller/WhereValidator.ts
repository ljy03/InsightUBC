import {InsightError, InsightDatasetKind} from "../controller/IInsightFacade";
import {QueryHelper} from "../controller/queryHelper";
import {QueryValidator} from "../controller/QueryValidator";

export class WhereValidator extends QueryValidator {
	constructor(helper: QueryHelper) {
		super(helper);
	}

	public validWhere(where: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(where)) {
				return reject(new InsightError("invalid where clause"));
			}
			if (Object.keys(where).length > 1) {
				return reject(new InsightError(" WHERE should only have 1 key, has more than 1"));
			} else if (Object.keys(where).length === 0) {
				return fulfill("");
			}

			let key = Object.keys(where)[0];
			if (this.invalidFilter.includes(key)) {
				return reject(new InsightError("WHERE contains invalid filter key"));
			}
			return fulfill(where);
		});
	}

	public validNegation(not: any): Promise<any> {
		// implement
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(not)) {
				return reject(new InsightError("NOT should contain valid query"));
			}

			if (Object.keys(not).length !== 1) {
				return reject(new InsightError("NOT should have 1 filter key"));
			}

			let key = Object.keys(not)[0];
			if (this.invalidFilter.includes(key)) {
				return reject(new InsightError("NOT contains invalid filter key"));
			}
			return fulfill(not);
		});
	}

	public validScomparision(sQuery: any): Promise<any> {
		// implement
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(sQuery)) {
				return reject(new InsightError("sQuery should be valid query filter"));
			}
			let skey = Object.keys(sQuery);
			if (skey.length !== 1) {
				return reject(new InsightError("should have 1 skey"));
			}

			// check id
			let lists = skey[0].split("_");
			if (lists.length !== 2 || !this.sKeys.includes(lists[1])) {
				return reject(new InsightError("invalid string comparator key"));
			}
			if (!this.idAndKindChecker(lists, true)) {
				return reject(new InsightError("s comparator id and kind check fail"));
			}

			let stringVal = sQuery[skey[0]];

			if (typeof stringVal !== "string") {
				return reject(new InsightError("Invalid value type should be string"));
			}
			if (stringVal === "*" || stringVal === "**") {
				return fulfill(sQuery);
			}
			if (stringVal.length >= 2) {
				let subStr = stringVal.substring(1, stringVal.length - 1);
				if (subStr.includes("*")) {
					return reject(new InsightError("string value can not have * in middle"));
				}
			}

			return fulfill(sQuery);
		});
	}

	public validLogic(logic: any): Promise<any> {
		// implement
		return new Promise((fulfill, reject) => {
			if (!Array.isArray(logic)) {
				return reject(new InsightError("logic should contain filter list"));
			}

			if (logic.length < 1) {
				return reject(new InsightError("AND/OR must be a non-empty array"));
			}

			let filters = [];

			for (let key of logic) {
				if (!this.validQuery(key)) {
					return reject(new InsightError("Logic array should contain valid query filter"));
				}
				if (Object.keys(key).length !== 1) {
					return reject(new InsightError("AND/OR array should have 1 filter key"));
				}
				if (this.invalidFilter.includes(Object.keys(key)[0])) {
					return reject(new InsightError("AND/OR array contain invalid filter key"));
				}
				filters.push(key);
			}
			return fulfill(filters);
		});
	}

	public validMcomparision(mQuery: any): Promise<any> {
		// implement
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(mQuery)) {
				return reject(new InsightError("mQuery should be valid query filter"));
			}
			let mkey = Object.keys(mQuery);
			if (mkey.length !== 1) {
				return reject(new InsightError("should have 1 mkey"));
			}

			let numberVal = mQuery[mkey[0]];
			if (typeof numberVal !== "number") {
				return reject(new InsightError("Invalid value type should be number"));
			}
			// remember to deal with id!!!!!!!!!!!!!!!!!!!!!!!!!
			let lists = mkey[0].split("_");
			if (lists.length !== 2 || !this.mKeys.includes(lists[1])) {
				return reject(new InsightError("invalid number comparator key"));
			}
			if (!this.idAndKindChecker(lists, true)) {
				return reject(new InsightError("M comparator id and kind checker fail"));
			}
			return fulfill(mQuery);
		});
	}
}
