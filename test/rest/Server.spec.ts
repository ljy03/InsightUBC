import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import * as fs from "fs-extra";

describe("Server", () => {
	let facade: InsightFacade;
	let server: Server;
	let SERVER_URL = "http://localhost:4321";
	let sections = fs.readFileSync("./test/resources/archives/pair.zip");
	let rooms = fs.readFileSync("./test/resources/archives/campus.zip");

	before(async () => {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			server.start();
		} catch (err) {
			console.log("error starting");
		}
	});

	after(async () => {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests

	it("PUT test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/sec/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equals(["sec"]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			expect.fail();
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation

	it("PUT test for rooms dataset", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/room/rooms")
				.send(rooms)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equals(["sec", "room"]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			expect.fail();
		}
	});

	it("PUT for invalid sections name", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/_invalid/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});

	it("PUT for another invalid sections name", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/ /sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});

	it("PUT for sections but kind rooms name", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/sects/rooms")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});

	it("PUT same id twice fail", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/sec/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});

	it("DELETE fail invalid id", async () => {
		try {
			return request(SERVER_URL)
				.delete("/dataset/notExist")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(404);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});

	it("List all", async () => {
		try {
			return request(SERVER_URL)
				.get("/datasets")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					expect(res.body.result).to.deep.equals([{id: "sec",
						kind: InsightDatasetKind.Sections,
						numRows: 64612}, {id: "room", kind: InsightDatasetKind.Rooms, numRows: 364}]);
				})
				.catch((err) => {
					expect.fail();
				});
		} catch (err) {
			expect.fail();
		}
	});
});
