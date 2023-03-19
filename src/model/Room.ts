export class Room {
	public fullname: string;
	public shortname: string;
	public number: string;
	public name: string;
	public address: string;
	public lat: number;
	public lon: number;
	public seats: number;
	public type: string;
	public furniture: string;
	public href: string;
	public fieldCounter: number;

	constructor() {
		this.fullname = "";
		this.shortname = "";
		this.number = "";
		this.name = "";
		this.address = "";
		this.lat = 0;
		this.lon = 0;
		this.seats = 0;
		this.type = "";
		this.furniture = "";
		this.href = "";
		this.fieldCounter = 0;
	}

	public set(
		fullname: string,
		shortname: string,
		number: string,
		name: string,
		address: string,
		lat: number,
		lon: number,
		seats: number,
		type: string,
		furniture: string,
		href: string
	) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.number = number;
		this.name = name;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.href = href;
	}

	public get(identifier: string): any {
		if (identifier === "fullname") {
			return this.fullname;
		} else if (identifier === "shortname") {
			return this.shortname;
		} else if (identifier === "number") {
			return this.number;
		} else if (identifier === "name") {
			return this.name;
		} else if (identifier === "address") {
			return this.address;
		} else if (identifier === "lat") {
			return this.lat;
		} else if (identifier === "lon") {
			return this.lon;
		} else if (identifier === "seats") {
			return this.seats;
		} else if (identifier === "type") {
			return this.type;
		} else if (identifier === "furniture") {
			return this.furniture;
		} else {
			return this.href;
		}
	}
}
