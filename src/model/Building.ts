export class Building {
	public fullname: string;
	public shortname: string;
	public href: string;
	public address: string;
	public lat: number;
	public lon: number;
	public hasGeo: boolean;
	public fieldCounter: number;

	constructor() {
		this.fullname = "";
		this.shortname = "";
		this.href = "";
		this.address = "";
		this.lat = 0;
		this.lon = 0;
		this.hasGeo = false;
		this.fieldCounter = 0;
	}
}
