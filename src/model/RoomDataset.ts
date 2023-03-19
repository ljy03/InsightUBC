import {Room} from "./Room";
import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";

export class RoomDataset {
	private insightDataset: InsightDataset;
	private roomList: Room[] = [];

	constructor(id: string, numRows: number, kind: InsightDatasetKind) {
		this.insightDataset = {
			id: id,
			kind: kind,
			numRows: numRows,
		} as InsightDataset;
	}

	public setRoomList(list: Room[]) {
		this.roomList = list;
	}

	public getInsightDataset(): InsightDataset {
		return this.insightDataset;
	}

	public getInsightDatasetKind(): InsightDatasetKind {
		return this.insightDataset.kind;
	}

	public getAll(): Room[] {
		return this.roomList;
	}
}
