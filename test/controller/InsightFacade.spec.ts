import {
	InsightDatasetKind,
	NotFoundError,
	ResultTooLargeError,
	InsightError,
	InsightDataset,
	InsightResult,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacadeTest", function () {
	let sections: string;
	let noCourse: string;
	let emptyFolder: string;
	let invalidJSON: string;
	let notInCourses: string;
	let nonZip: string;
	let facade: InsightFacade;
	let noJson: string;
	let rooms: string;
	let emptyRoom: string;
	let invalidRoom: string;
	let missBuildingFile: string;
	let missBuilding: string;
	let invalidSec: string;

	type Input = unknown;
	type Output = Promise<InsightResult[]>;
	type Error = "ResultTooLargeError" | "InsightError";

	before(function () {
// 		sections = getContentFromArchives("pair.zip");
// 		emptyFolder = getContentFromArchives("empty.zip");
// 		noCourse = getContentFromArchives("noValidCourses.zip");
// 		invalidJSON = getContentFromArchives("invalidJSON.zip");
// 		notInCourses = getContentFromArchives("notInCourses.zip");
// 		nonZip = getContentFromArchives("pdfNonZip.pdf");
// 		noJson = getContentFromArchives("noJson.zip");
// 		rooms = getContentFromArchives("campus.zip");
// 		emptyRoom = getContentFromArchives("roomsEmpty.zip");
// 		invalidRoom = getContentFromArchives("invalidRooms.zip");
// 		missBuilding = getContentFromArchives("missBuilding.zip");
// 		missBuildingFile = getContentFromArchives("missBuildingFile.zip");
// 		invalidSec = getContentFromArchives("invalidTwo.zip");
	});

	describe("Tests", function () {
// 		describe("NonQueryTest", function () {
// 			beforeEach(function () {
// 				clearDisk();
// 				facade = new InsightFacade();
// 			});
//
// 			it("should add one valid section", function () {
// 				const result = facade.addDataset("invalidSec", invalidSec, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.have.members(["invalidSec"]);
// 			});
// 			it("should reject add declare kind dataset", function () {
// 				const result = facade.addDataset("rooms", rooms, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject with an empty dataset id", function () {
// 				const result = facade.addDataset("", rooms, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should fail to remove dataset with non-existing id", function () {
// 				const result = facade
// 					.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
// 					.then(() => facade.removeDataset("notExist"));
// 				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 			});
//
// 			it("should successfully remove existing dataset", function () {
// 				const result = facade
// 					.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
// 					.then(() => facade.removeDataset("rooms"));
// 				return expect(result).to.eventually.equal("rooms");
// 			});
//
// 			it("should fulfill with no dataset", function () {
// 				const result = facade.listDatasets();
// 				return expect(result).to.eventually.deep.equal([]);
// 			});
//
// 			it("should reject empty room", function () {
// 				const result = facade.addDataset("invalidRoom", invalidRoom, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should add room dataset", function () {
// 				const result = facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.have.members(["rooms"]);
// 			});
// 			it("should add room dataset with some miss building file", function () {
// 				const result = facade.addDataset("missBuilding", missBuilding, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.have.members(["missBuilding"]);
// 			});
// 			it("should fail add room dataset with index.htm missing", function () {
// 				const result = facade.addDataset("missBuildingFile", missBuildingFile, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should successfully list added dataset with load", async function () {
// 				try {
// 					let result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
// 					let resOne = await facade.listDatasets();
// 					console.log(resOne);
// 					facade = new InsightFacade();
//
// 					let res = await facade.listDatasets();
// 					console.log(res);
// 					return expect(res).to.deep.equal([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612}]);
// 				} catch (error: any) {
// 					console.log(error.message);
// 				}
// 			});
//
// 			it("should successfully list added dataset load 2", function () {
// 				const result = facade
// 					.addDataset("ubc", sections, InsightDatasetKind.Sections)
// 					.then(() => (facade = new InsightFacade()))
// 					.then(() => facade.listDatasets());
// 				return expect(result).to.eventually.deep.equal([
// 					{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612},
// 				]);
// 			});
//
// 			it("should reject with an empty dataset id", function () {
// 				const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should add dataset", function () {
// 				const result = facade.addDataset("sections", sections, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.have.members(["sections"]);
// 			});
//
// 			it("should fail to remove dataset with non-existing id", function () {
// 				const result = facade
// 					.addDataset("sections", sections, InsightDatasetKind.Sections)
// 					.then(() => facade.removeDataset("notExist"));
// 				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 			});
//
// 			it("should successfully remove existing dataset", function () {
// 				const result = facade
// 					.addDataset("sections", sections, InsightDatasetKind.Sections)
// 					.then(() => facade.removeDataset("sections"));
// 				return expect(result).to.eventually.equal("sections");
// 			});
//
// 			it("should successfully list added dataset", function () {
// 				const result = facade
// 					.addDataset("ubc", sections, InsightDatasetKind.Sections)
// 					.then(() => facade.listDatasets());
// 				return expect(result).to.eventually.deep.equal([
// 					{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612},
// 				]);
// 			});
//
// 			it("should fulfill with no dataset", function () {
// 				const result = facade.listDatasets();
// 				return expect(result).to.eventually.deep.equal([]);
// 			});
//
// 			it("should fail query after removing dataset", function () {
// 				const result = facade
// 					.addDataset("sections", sections, InsightDatasetKind.Sections)
// 					.then(() => facade.removeDataset("sections"))
// 					.then(() =>
// 						facade.performQuery({
// 							WHERE: {
// 								GT: {
// 									sections_avg: 98,
// 								},
// 							},
// 							OPTIONS: {
// 								ORDER: "sections_avg",
// 								COLUMNS: ["sections_dept", "sections_avg"],
// 							},
// 						})
// 					);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should fail to remove from empty dataset", function () {
// 				const result = facade.removeDataset("notExist");
// 				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 			});
//
// 			it("should fail to remove with invalid id with underscore", function () {
// 				const result = facade.removeDataset("sections_");
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should fail to remove with invalid id with just whitespace", function () {
// 				const result = facade.removeDataset(" ");
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should fail to remove with empty id", function () {
// 				const result = facade.removeDataset("");
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject with dataset id containing underscore", function () {
// 				const result = facade.addDataset("sections_", sections, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject with dataset id containing only whitespace", function () {
// 				const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should not add same dataset multiple times", function () {
// 				const result = facade
// 					.addDataset("sections", sections, InsightDatasetKind.Sections)
// 					.then(() => facade.addDataset("sections", sections, InsightDatasetKind.Sections));
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject adding empty file with no courses", function () {
// 				const result = facade.addDataset("empty", emptyFolder, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject invalid JSON format", function () {
// 				const result = facade.addDataset("invalidJSON", invalidJSON, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
// 			it("should reject empty room", function () {
// 				const result = facade.addDataset("emptyRoom", emptyRoom, InsightDatasetKind.Rooms);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject when data not courses folder", function () {
// 				const result = facade.addDataset("notInCourses", notInCourses, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject when there is no course", function () {
// 				const result = facade.addDataset("noCourse", noCourse, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject when file is not zip", function () {
// 				const result = facade.addDataset("nonZip", nonZip, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
//
// 			it("should reject when file contain no json files", function () {
// 				const result = facade.addDataset("noJson", noJson, InsightDatasetKind.Sections);
// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
// 			});
// 		});
//
// 		describe("QueryTest", function () {
// 			before(async function () {
// 				clearDisk();
// 				// sections = await getContentFromArchives("pair.zip");
// 				facade = new InsightFacade();
// 				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
// 				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			});
//
// 			beforeEach(function () {
// 				facade = new InsightFacade();
// 			});
//
// 			function assertOnError(actual: unknown, expected: Error): void {
// 				if (expected === "InsightError") {
// 					expect(actual).to.be.an.instanceOf(InsightError);
// 				} else if (expected === "ResultTooLargeError") {
// 					expect(actual).to.be.an.instanceOf(ResultTooLargeError);
// 				} else {
// 					expect.fail("UNEXPECTED ERROR");
// 				}
// 			}
//
// 			function errorValidator(error: any): error is Error {
// 				return error === "ResultTooLargeError" || error === "InsightError";
// 			}
//
// 			function assertOnResult(actual: unknown, expected: Output): void {
// 				expect(actual).to.deep.equal(expected);
// 			}
//
// 			function targetTest(input: Input): Output {
// 				return facade.performQuery(input);
// 			}
//
// 			folderTest<Input, Output, Error>("Testing Queries", targetTest, "./test/resources/queries/rooms/all", {
// 				errorValidator,
// 				assertOnError,
// 				assertOnResult,
// 			});
// 		});
	});
}); /*

/* describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it ("should reject with  an empty dataset id", function() {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});
	 */
/*
 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
/*
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
}); */
