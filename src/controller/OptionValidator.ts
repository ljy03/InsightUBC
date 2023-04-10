import {InsightError, InsightDatasetKind} from "../controller/IInsightFacade";
import {QueryHelper} from "../controller/queryHelper";
import {QueryValidator} from "../controller/QueryValidator";

export class OptionValidator extends QueryValidator {
	constructor(helper: QueryHelper) {
		super(helper);
	}

	public validOptions(options: any): Promise<any> {
		// implement
		return new Promise((fulfill, reject) => {
			if (!this.validQuery(options)) {
				return reject(new InsightError("invalid options query clause"));
			}

			let optionKeys = Object.keys(options);
			if (optionKeys.length === 0 || optionKeys.length > 2) {
				return reject(new InsightError("OPTIONS should have 1 or 2 keys"));
			}

			for (let key of optionKeys) {
				if (key !== "COLUMNS" && key !== "ORDER") {
					return reject(new InsightError("invalid key in OPTIONS"));
				}
			}

			if (optionKeys.length === 2 && !optionKeys.includes("ORDER")) {
				return reject(new InsightError("two option keys should have 1 SORT"));
			}

			if (!optionKeys.includes("COLUMNS")) {
				return reject(new InsightError("option keys must have COLUMNS"));
			}

			return fulfill(options);
		});
	}

	public validColumns(columns: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (!Array.isArray(columns)) {
				return reject(new InsightError("columns should be array"));
			}
			if (columns.length < 1) {
				return reject(new InsightError("COLUMNS must be a non-empty array"));
			}

			let rtnCols = [];
			for (let col of columns) {
				if (typeof col !== "string") {
					return reject(new InsightError("COLUMNS should be string"));
				}

				let lists = col.split("_");
				if (lists.length !== 2 && lists.length !== 1) {
					return reject(new InsightError("invalid columns key"));
				}
				if (lists.length === 2 && !this.sectionKeys.includes(lists[1]) && !this.roomKeys.includes(lists[1])) {
					return reject(new InsightError("invalid cols key not in sections nor in rooms"));
				}

				let lengthCheck = lists.length === 2;
				if (!this.idAndKindChecker(lists, lengthCheck)) {
					return reject(new InsightError("cols fail id and kind checker"));
				}

				rtnCols.push(col);
			}

			return fulfill(rtnCols);
		});
	}

	public validOrder(order: any): Promise<any> {
		return new Promise((fulfill, reject) => {
			if (typeof order !== "string" && !this.validQuery(order)) {
				return reject(new InsightError("ORDER should be string or a valid query"));
			}

			let rtn = [];
			let dir = "";
			let rtnkeys = [];
			if (typeof order === "string") {
				let lists = order.split("_");
				if (lists.length !== 2 && lists.length !== 1) {
					return reject(new InsightError("invalid order key"));
				}

				if (lists.length === 2 && !this.sectionKeys.includes(lists[1]) && !this.roomKeys.includes(lists[1])) {
					return reject(new InsightError("invalid order key not in sections nor in rooms"));
				}

				let lengthCheck = lists.length === 2;
				if (!this.idAndKindChecker(lists, lengthCheck)) {
					return reject(new InsightError("order fail id and kind checker"));
				}

				rtnkeys.push(order);
				rtn = [dir, rtnkeys];
				return fulfill(rtn);
			}

			let child = Object.keys(order);

			if (child.length !== 2 || !child.includes("dir") || !child.includes("keys")) {
				return reject(new InsightError("sort should include only dir and keys key"));
			}

			let direction = order["dir"];
			if (direction !== "UP" && direction !== "DOWN") {
				return reject(new InsightError("dir should be UP or DOWN"));
			}

			let keys: any = order["keys"];
			if (!this.validOrderKeys(keys)) {
				return reject(new InsightError("order key list not valid"));
			}

			rtn = [direction, keys];
			return fulfill(rtn);
		});
	}

	public validOrderKeys(keys: any): boolean {
		if (!Array.isArray(keys)) {
			return false;
		}
		if (keys.length < 1) {
			return false;
		}

		for (let key of keys) {
			if (typeof key !== "string") {
				return false;
			}

			let lists = key.split("_");
			if (lists.length !== 2 && lists.length !== 1) {
				return false;
			}

			if (lists.length === 2 && !this.sectionKeys.includes(lists[1]) && !this.roomKeys.includes(lists[1])) {
				return false;
			}
			let lengthCheck = lists.length === 2;
			if (!this.idAndKindChecker(lists, lengthCheck)) {
				return false;
			}
		}
		return true;
	}
}
