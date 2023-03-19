import {InsightError, InsightDatasetKind} from "../controller/IInsightFacade";
import {QueryHelper} from "../controller/queryHelper";

export abstract class QueryValidator {
	protected invalidFilter = ["WHERE", "OPTIONS", "COLUMNS", "ORDER", "TRANSFORMATIONS", "GROUP", "APPLY"];
	protected sectionKeys = ["uuid", "id", "title", "instructor", "dept", "year", "avg", "pass", "fail", "audit"];
	protected roomKeys = [
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"lat",
		"lon",
		"seats",
		"type",
		"furniture",
		"href",
	];

	protected mKeys = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

	protected sKeys = [
		"uuid",
		"id",
		"title",
		"instructor",
		"dept",
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"type",
		"furniture",
		"href",
	];

	protected helper: QueryHelper;

	constructor(helper: QueryHelper) {
		this.helper = helper;
	}

	protected idAndKindChecker(lists: string[], lengthCheck: boolean): boolean {
		if (lengthCheck && this.helper.getKind(lists[0]) === InsightDatasetKind.Sections) {
			if (this.roomKeys.includes(lists[1])) {
				return false;
			}
		}
		if (lengthCheck && this.helper.getKind(lists[0]) === InsightDatasetKind.Rooms) {
			if (this.sectionKeys.includes(lists[1])) {
				return false;
			}
		}
		if (lengthCheck) {
			if (!this.helper.checkID(lists[0])) {
				return false;
			}
		}
		return true;
	}

	public validQuery(query: any): boolean {
		// check if query is valid or not
		return !(
			query === null ||
			query === undefined ||
			typeof query === "number" ||
			typeof query === "string" ||
			Array.isArray(query)
		);
	}
}
