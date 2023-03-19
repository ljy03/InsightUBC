export class Section {
	private uuid: string;
	private id: string;
	private title: string;
	private instructor: string;
	private dept: string;
	private year: number;
	private avg: number;
	private pass: number;
	private fail: number;
	private audit: number;

	constructor() {
		this.uuid = "";
		this.id = "";
		this.title = "";
		this.instructor = "";
		this.dept = "";
		this.year = 0;
		this.avg = 0;
		this.pass = 0;
		this.fail = 0;
		this.audit = 0;
	}

	public set(
		id: string,
		course: string,
		title: string,
		professor: string,
		subject: string,
		year: number,
		avg: number,
		pass: number,
		fail: number,
		audit: number
	) {
		this.uuid = id;
		this.id = course;
		this.title = title;
		this.instructor = professor;
		this.dept = subject;
		this.year = year;
		this.avg = avg;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
	}

	public get(identifier: string): any {
		if (identifier === "uuid") {
			return this.uuid;
		} else if (identifier === "id") {
			return this.id;
		} else if (identifier === "title") {
			return this.title;
		} else if (identifier === "instructor") {
			return this.instructor;
		} else if (identifier === "dept") {
			return this.dept;
		} else if (identifier === "year") {
			return this.year;
		} else if (identifier === "avg") {
			return this.avg;
		} else if (identifier === "pass") {
			return this.pass;
		} else if (identifier === "fail") {
			return this.fail;
		} else {
			return this.audit;
		}
	}
}
