import {Section} from "../model/Section";
import {Decimal} from "decimal.js";

export class Utils {
	constructor() {
		// nothing
	}

	public calcRule(data: any, rule: string[]): number {
		if (data.length === 0) {
			return 0;
		}

		let key = rule[0];
		let check = rule[1].split("_")[1];

		if (key === "MAX") {
			return this.findMax(data, check);
		} else if (key === "MIN") {
			return this.findMin(data, check);
		} else if (key === "SUM") {
			let sum = this.findSum(data, check);
			return Number(sum.toFixed(2));
		} else if (key === "AVG") {
			return this.findAvg(data, check);
		} else {
			return this.findCount(data, check);
		}
	}

	public findAvg(data: any, rule: string): number {
		let total = new Decimal(0);
		let numRow = data.length;

		for (let d of data) {
			let value = d.get(rule);
			let dValue = new Decimal(value);
			total = Decimal.add(total, dValue);
		}
		let avg = total.toNumber() / numRow;
		avg = Number(avg.toFixed(2));
		return avg;
	}

	public findMax(data: any, rule: string): number {
		let max = data[0].get(rule);
		for (let i = 1; i < data.length; i++) {
			if (data[i].get(rule) > max) {
				max = data[i].get(rule);
			}
		}
		return max;
	}

	public findMin(data: any, rule: string): number {
		// 		let min = data[0].get(rule);
		// 		for (let i = 1; i < data.length; i++) {
		// 			if (data[i].get(rule) < min) {
		// 				min = data[i].get(rule);
		// 			}
		// 		}
		// 		return min;
		let min = data[0].get(rule);
		for (let d of data) {
			if (d.get(rule) < min) {
				min = d.get(rule);
			}
		}
		return min;
	}

	public findSum(data: any, rule: string): number {
		let sum = 0;
		for (let d of data) {
			sum = sum + d.get(rule);
		}
		return sum;
	}

	public findCount(datas: any, rule: string): number {
		let temp: Map<number, number> = new Map<number, number>();
		let count = 0;
		for (let data of datas) {
			let value = temp.get(data.get(rule));
			if (value !== undefined) {
				value = value + 1;
				temp.set(data.get(rule), value);
			} else {
				temp.set(data.get(rule), 0);
				count++;
			}
		}

		return count;
	}

	public sortHelper(result: any[], order: string[], dir: string): any[] {
		let list = result;
		if (order.length === 1 && dir === "") {
			list.sort(function (a: any, b: any) {
				if (a.get(order[0]) <= b.get(order[0])) {
					return -1;
				} else {
					return 1;
				}
			});
			return list;
		}

		if (dir === "UP") {
			list.sort(function (a: any, b: any) {
				for (let each of order) {
					if (a.get(each) < b.get(each)) {
						return -1;
					} else if (a.get(each) > b.get(each)) {
						return 1;
					}
				}
				return 0;
			});
		} else {
			list.sort(function (a: any, b: any) {
				for (let each of order) {
					if (a.get(each) < b.get(each)) {
						return 1;
					} else if (a.get(each) > b.get(each)) {
						return -1;
					}
				}
				return 0;
			});
		}

		return list;
	}

	public comparatorMatch(key: string, comparators: Map<string, any>, dataset: any[]): any[] {
		let kv: any[][] = [];
		let rtn = [];
		for (let [k, v] of comparators) {
			kv.push([k, v]);
		}
		let ke = kv[0][0].split("_")[1];
		if (key === "GT") {
			for (let each of dataset) {
				if (each.get(ke) > kv[0][1]) {
					rtn.push(each);
				}
			}
		} else if (key === "LT") {
			for (let each of dataset) {
				if (each.get(ke) < kv[0][1]) {
					rtn.push(each);
				}
			}
		} else if (key === "EQ") {
			for (let each of dataset) {
				if (each.get(ke) === kv[0][1]) {
					rtn.push(each);
				}
			}
		} else {
			if (kv[0][1] === "*" || kv[0][1] === "**") {
				rtn = dataset;
			} else {
				let subStr = kv[0][1];
				rtn = this.compareString(subStr, ke, dataset);
			}
		}
		return rtn;
	}

	public compareString(s: string, key: string, dataset: any[]): any[] {
		let subStr = s;
		let rtn = [];
		let start = false;
		let end = false;
		if (s.startsWith("*")) {
			subStr = subStr.substring(1, subStr.length);
			start = true;
		}
		if (s.endsWith("*")) {
			subStr = subStr.substring(0, subStr.length - 1);
			end = true;
		}
		for (let each of dataset) {
			if (start && end) {
				if (each.get(key).includes(subStr)) {
					rtn.push(each);
				}
			} else if (start && !end) {
				if (each.get(key).endsWith(subStr)) {
					rtn.push(each);
				}
			} else if (!start && end) {
				if (each.get(key).startsWith(subStr)) {
					rtn.push(each);
				}
			} else {
				if (each.get(key) === subStr) {
					rtn.push(each);
				}
			}
		}
		return rtn;
	}

	public union(dataOne: any[], dataTwo: any[]): any[] {
		let result: any[] = [];
		for (let data of dataOne) {
			result.push(data);
		}
		for (let data of dataTwo) {
			if (!result.includes(data)) {
				result.push(data);
			}
		}
		return result;
	}

	public intersect(dataOne: any[], dataTwo: any[]): any[] {
		let result: any[] = [];
		for (let data of dataTwo) {
			if (dataOne.includes(data)) {
				result.push(data);
			}
		}
		return result;
	}

	public minus(dataOne: any[], dataTwo: any[]): any[] {
		let result: any[] = [];
		for (let data of dataOne) {
			if (!dataTwo.includes(data)) {
				result.push(data);
			}
		}
		return result;
	}

	public getAll(dataset: any): Section[] {
		return dataset.getAll();
	}

	public validateQuery(query: any): boolean {
		if (
			query === null ||
			query === undefined ||
			typeof query === "number" ||
			typeof query === "string" ||
			Array.isArray(query)
		) {
			return false;
		}
		let keys = Object.keys(query);
		if (keys.length !== 2 && keys.length !== 3) {
			return false;
		}
		if (keys.length === 2 && !(keys.includes("WHERE") && keys.includes("OPTIONS"))) {
			return false;
		}

		if (
			keys.length === 3 &&
			!(keys.includes("WHERE") && keys.includes("TRANSFORMATIONS") && keys.includes("OPTIONS"))
		) {
			return false;
		}

		return true;
	}
}
