import {Section} from "./Section";
import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";

export class SectionDataset {
	private insightDataset: InsightDataset;
	private sectionList: Section[] = [];

	constructor(id: string, numRows: number, kind: InsightDatasetKind) {
		this.insightDataset = {
			id: id,
			kind: kind,
			numRows: numRows,
		} as InsightDataset;
	}

	public setSectionList(list: Section[]) {
		this.sectionList = list;
	}

	public getInsightDataset(): InsightDataset {
		return this.insightDataset;
	}

	public getInsightDatasetKind(): InsightDatasetKind {
		return this.insightDataset.kind;
	}

	public getAll(): Section[] {
		return this.sectionList;
	}
}
