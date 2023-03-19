export class Group {
	public term: string;
	public label: Map<string, any> = new Map<string, any>();
	public list: any[] = [];
	public qLabel: Map<string, any> = new Map<string, any>();

	constructor() {
		this.term = "";
	}

	public setLabel(l: Map<string, any>) {
		for (let [k, v] of l) {
			this.label.set(k, v);
		}
	}
}
