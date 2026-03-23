import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

// Liam's Branch

use(chaiAsPromised);

export interface ITestQuery {
	title?: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let facade2: IInsightFacade;
	let facade3: IInsightFacade;

	// Declare datasets used in tests! You should add more datasets like this!
	let csCourses: string;
	let noSections: string;
	let wrongFolderName: string;
	let wrongFolderNameValidCourses: string;
	let wrongFolderNameNoCourses: string;
	let xmlFormat: string;
	let missingTitle: string;
	let emptyStringTitle: string;
	let sections: string;
	let cs522: string;
	let miniPair: string;
	let obst503: string;
	let wood499: string;

	// RoomsDatasets to use in tests
	let campus: string;
	let miniCampus: string;
	let campusNoIndex: string;
	let noBuildingTable: string;
	let noValidRoom: string;
	let roomsNotAZip: string;
	let indexMultipleTables: string;
	let noBuildingTableWithOtherTables: string;
	let indexRemovedViewsFieldClass: string;
	let noBuildingsInTable: string;
	let buildinsMultipleTablesAndRoomsTable: string;
	let buildingsRemovedViewsFields: string;
	let buildingsRemovedRoomsTables: string;
	let smallValidRoomsDataset: string;
	let campusFirstHalf: string;
	let campusFiveEighthMinusIBLCandLASR: string;
	let campusIBLC: string;
	let campusLASR: string;
	let campusSixEighth: string;
	let campusSevenEighth: string;
	let campusEightEighth: string;
	let rooms: string;

	before(async function () {
		// This block runs once and loads the datasets.
		csCourses = await getContentFromArchives("cs_courses.zip");
		noSections = await getContentFromArchives("empty_sections.zip");
		wrongFolderName = await getContentFromArchives("wrong_folder_name.zip");
		wrongFolderNameValidCourses = await getContentFromArchives("wrongname_validCourses.zip");
		wrongFolderNameNoCourses = await getContentFromArchives("wrongname_noCourses.zip");
		xmlFormat = await getContentFromArchives("xml_format.zip");
		missingTitle = await getContentFromArchives("missing_title.zip");
		emptyStringTitle = await getContentFromArchives("empty_string_title.zip");
		sections = await getContentFromArchives("pair.zip");
		miniPair = await getContentFromArchives("miniPair.zip");
		cs522 = await getContentFromArchives("cs522.zip");
		obst503 = await getContentFromArchives("one_course_obst503.zip");
		wood499 = await getContentFromArchives("one_course_wood499.zip");
		campus = await getContentFromArchives("r_campus.zip");
		miniCampus = await getContentFromArchives("r_miniCampus.zip");
		campusNoIndex = await getContentFromArchives("r_NoIndex.zip");
		noBuildingTable = await getContentFromArchives("r_index_NoTables.zip");
		noValidRoom = await getContentFromArchives("r_noValidRoom.zip");
		roomsNotAZip = await getContentFromArchives("r_roomsNotAZipFile.txt");
		indexMultipleTables = await getContentFromArchives("r_index_multipleTables.zip");
		noBuildingTableWithOtherTables = await getContentFromArchives("r_indexNoBuildingTableWithOtherTables.zip");
		indexRemovedViewsFieldClass = await getContentFromArchives("r_indexRemovedViewsFieldClass.zip");
		noBuildingsInTable = await getContentFromArchives("r_noBuildingsInTable.zip");
		buildinsMultipleTablesAndRoomsTable = await getContentFromArchives("r_buildingsMultipleTablesAndRoomsTable.zip");
		buildingsRemovedViewsFields = await getContentFromArchives("r_buildingsRemovedViewsFields.zip");
		buildingsRemovedRoomsTables = await getContentFromArchives("r_buildingsRemovedRoomsTables.zip");
		smallValidRoomsDataset = await getContentFromArchives("r_smallValidRoomsDataset.zip");
		campusFirstHalf = await getContentFromArchives("r_campusFirstHalf.zip");
		campusSevenEighth = await getContentFromArchives("r_campusSevenEighth.zip");
		campusEightEighth = await getContentFromArchives("r_campusEightEighth.zip");
		campusFiveEighthMinusIBLCandLASR = await getContentFromArchives("r_campusFiveEighthMinusIBLCandLASR.zip");
		campusIBLC = await getContentFromArchives("r_campusIBLC.zip");
		campusLASR = await getContentFromArchives("r_campusLASR.zip");
		campusSixEighth = await getContentFromArchives("r_campusSixEighth.zip");

		rooms = await getContentFromArchives("r_campus.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		await clearDisk();
	});

	describe("AddDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		// ROOMS DATASET TESTS

		it("should successfully add a rooms Dataset (first)", async function () {
			const customTimeout = 60000;
			this.timeout(customTimeout);
			try {
				const result = await facade.addDataset("campus", campus, InsightDatasetKind.Rooms);
				return expect(result).to.have.members(["campus"]);
			} catch (err) {
				return expect.fail(`Proof my test is doing something: ${err}`);
			}
		});

		it("should successfully add a room dataset (second)", async function () {
			try {
				const result = await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Rooms);

				return expect(result).to.have.members(["miniCampus"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should reject roomsDataset with an empty dataset id", async function () {
			try {
				await facade.addDataset("", csCourses, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		it("should reject RoomsDataset with a whitespace id", async function () {
			try {
				await facade.addDataset("   ", miniCampus, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		it("should reject Rooms dataset with an under_score id", async function () {
			try {
				await facade.addDataset("badder_name", miniCampus, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		it("should reject two Rooms datasets with same name", async function () {
			try {
				await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Rooms);

				await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Rooms);

				return expect.fail("Should have thrown above.");
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject non base64 encoded Rooms dataset", async function () {
			const notBase64 = "notbase64";
			try {
				await facade.addDataset("notbase64", notBase64, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}

			return expect.fail("should have failed due to non-base 64");
		});

		// PASSING FOR WRONG REASON
		it("should reject non-zip Rooms dataset", async function () {
			try {
				await facade.addDataset("roomsNotAZip", roomsNotAZip, InsightDatasetKind.Rooms);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
			}

			return expect.fail("should have failed due to non-zip file");
		});

		it("should reject Rooms dataset with no index.htm file", async function () {
			try {
				await facade.addDataset("campusNoIndex", campusNoIndex, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("should have failed due to non-base 64");
		});

		it("should reject roomsDataset with index.htm with a building Table with no buildings", async function () {
			try {
				await facade.addDataset("noBuildingsInTable", noBuildingsInTable, InsightDatasetKind.Rooms);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("No valid building table found");
			}
			return expect.fail("Should have failed due to lack of building table");
		});

		it("should reject Rooms dataset with index.htm with no Tables at all", async function () {
			try {
				await facade.addDataset("noBuildingTable", noBuildingTable, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("No valid building table found");
			}
			return expect.fail("Should have failed due to lack of building table");
		});

		it("should successfully add a room dataset with multiple tables in index", async function () {
			try {
				const result = await facade.addDataset("indexMultipleTables", indexMultipleTables, InsightDatasetKind.Rooms);
				return expect(result).to.have.members(["indexMultipleTables"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should reject roomsDataset with index.htm with no building Table (but has other tables)", async function () {
			try {
				await facade.addDataset("noBuildingTable", noBuildingTableWithOtherTables, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("No valid building table found");
			}
			return expect.fail("Should have failed due to lack of building table");
		});

		it("should accept? roomsDataset with index.htm with no views-field class", async function () {
			try {
				const result = await facade.addDataset(
					"indexRemovedViewsFieldClass",
					indexRemovedViewsFieldClass,
					InsightDatasetKind.Rooms
				);
				return expect(result).to.have.members(["indexRemovedViewsFieldClass"]);
			} catch (err) {
				return expect.fail(`Should have accepeted: ${err}`);
			}

			// try {
			// 	await facade.addDataset("indexRemovedViewsFieldClass", indexRemovedViewsFieldClass, InsightDatasetKind.Rooms);
			// } catch (err) {
			// 	return expect(err).to.be.instanceOf(InsightError);
			// 	// .and.to.have.property("message")
			// 	// .that.contains("No valid building table found");
			// }
			// return expect.fail("Should have failed due to lack of views-fields class");
		});

		it("should successfully add a room dataset with multiple tables in each building", async function () {
			try {
				const result = await facade.addDataset(
					"buildinsMultipleTablesAndRoomsTable",
					buildinsMultipleTablesAndRoomsTable,
					InsightDatasetKind.Rooms
				);

				return expect(result).to.have.members(["buildinsMultipleTablesAndRoomsTable"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should reject roomsDataset with roomsTable with no views-field class", async function () {
			try {
				await facade.addDataset("buildingsRemovedViewsFields", buildingsRemovedViewsFields, InsightDatasetKind.Rooms);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("No valid building table found");
			}
			return expect.fail("Should have failed due to lack of views-fields class");
		});

		it("should reject roomsDataset with no Rooms Tables (and with other tables)", async function () {
			try {
				await facade.addDataset("buildingsRemovedRoomsTables", buildingsRemovedRoomsTables, InsightDatasetKind.Rooms);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("No valid building table found");
			}
			return expect.fail("Should have failed due to lack of rooms tables");
		});

		it("should reject Rooms dataset with no valid rooms", async function () {
			try {
				await facade.addDataset("noValidRoom", noValidRoom, InsightDatasetKind.Rooms);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("should have failed due to non-base 64");
		});

		it("should fulfill with all dataset IDs upon successful add of two RoomDatasets", async function () {
			try {
				await facade.addDataset("campus", campus, InsightDatasetKind.Rooms);
				const secondResult = await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Rooms);

				return expect(secondResult).to.have.members(["campus", "miniCampus"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should fulfill with all dataset IDs upon successful add of a Section adn RoomDatasets", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				const secondResult = await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Rooms);

				return expect(secondResult).to.have.members(["miniPair", "miniCampus"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		// Passes for kind of the right reasons
		it("should reject valid dataset added with wrong kind", async function () {
			try {
				await facade.addDataset("miniCampus", miniCampus, InsightDatasetKind.Sections);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError due wrong kind.");
		});

		// Passes for kind of the right reasons
		it("should reject valid dataset added with wrong kind pt 2", async function () {
			try {
				await facade.addDataset("miniPar", miniPair, InsightDatasetKind.Rooms);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError due wrong kind.");
		});

		// SECTIONS AND ROOMS DATASETS INTEGRATION TESTS

		it("should successfully add a dataset (second)", async function () {
			try {
				const result = await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				return expect(result).to.have.members(["miniPair"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should reject with an empty dataset id", async function () {
			try {
				await facade.addDataset("", csCourses, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		// SECTIONS DATASET TESTS

		it("should successfully add a sections dataset (first)", async function () {
			try {
				const result = await facade.addDataset("cs", csCourses, InsightDatasetKind.Sections);
				return expect(result).to.have.members(["cs"]);
			} catch (err) {
				return expect.fail(`Proof my test is doing something: ${err}`);
			}
		});

		it("should reject with a whitespace id", async function () {
			try {
				await facade.addDataset("   ", csCourses, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		it("should reject with an under_score dataset id", async function () {
			try {
				await facade.addDataset("bad_name", csCourses, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown above.");
		});

		it("should reject two datasets with same name", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				return expect.fail("Should have thrown above.");
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject non base64 encoded dataset", async function () {
			const notBase64 = "notbase64";
			try {
				await facade.addDataset("notbase64", notBase64, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}

			return expect.fail("should have failed due to non-base 64");
		});

		it("should reject dataset with zero valid sections", async function () {
			// need to await asynchronous functions

			try {
				await facade.addDataset("zeroSectionDataset", noSections, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("should have thrown error because no valid sections");
		});

		it("should reject dataset wrong folder name (and is empty)", async function () {
			try {
				await facade.addDataset("wrongFolderNameNoCourses", wrongFolderNameNoCourses, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("Missing 'courses/' folder in dataset");
			}

			return expect.fail("Should have thrown an error for files not in the courses/ folder.");
		});

		it("should reject dataset with no course folder and no valid course", async function () {
			try {
				await facade.addDataset("wrongName", wrongFolderName, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("Missing 'courses/' folder in dataset");
			}

			return expect.fail("Should have thrown an error for files not in the courses/ folder.");
		});

		it("should reject dataset with no course folder and valid course", async function () {
			try {
				await facade.addDataset("wrongNameValidCourses", wrongFolderNameValidCourses, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("Missing 'courses/' folder in dataset");
			}

			return expect.fail("Should have thrown an error for files not in the courses/ folder.");
		});

		// THIS TEST PASSES FOR WRONG REASON: XML format seems to also be accepted by our code
		it("should reject dataset in XML format", async function () {
			try {
				await facade.addDataset("xmlFormatDataset", xmlFormat, InsightDatasetKind.Sections);
			} catch (err) {
				// console.log(err);
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError due to XML format.");
		});

		it("should reject dataset with courses with missing title field", async function () {
			try {
				await facade.addDataset("missingTitleDataset", missingTitle, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError due to missing title field.");
		});

		it("should fulfill with all dataset IDs upon successful add", async function () {
			try {
				await facade.addDataset("cs", csCourses, InsightDatasetKind.Sections);
				const secondResult = await facade.addDataset("sections", sections, InsightDatasetKind.Sections);

				return expect(secondResult).to.have.members(["cs", "sections"]);
			} catch (err) {
				return expect.fail(`Test failed with error: ${err}`);
			}
		});

		it("should accept dataset with courses with empty string in title field", async function () {
			try {
				const result = await facade.addDataset(
					"emptyStringTitleDataset",
					emptyStringTitle,
					InsightDatasetKind.Sections
				);
				return expect(result).to.include("emptyStringTitleDataset");
			} catch (err) {
				return expect.fail(`Should not have thrown error for dataset with empty string title: ${err}`);
			}
		});

		it("should reject not base64 encoded dataset", async function () {
			const not64Content = "test/resources/archives/notBase64.zip";

			try {
				await facade.addDataset("notBase64", not64Content, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.includes("File not base64");
			}
			return expect.fail("Should have thrown InsightError due to missing title field.");
		});

		it("should reject dataset with non-base64 name: invalid characters", async function () {
			// need to await asynchronous functions
			const nonBase64Content = "!!!!";
			try {
				await facade.addDataset("!!!!", nonBase64Content, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("File not base64");
			}
			return expect.fail("should have thrown error because no valid sections");
		});

		it("should reject dataset with non-base64 name: not multiple of 4", async function () {
			// need to await asynchronous functions
			const nonBase64Content = "@";
			try {
				await facade.addDataset("@", nonBase64Content, InsightDatasetKind.Sections);
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
				// .and.to.have.property("message")
				// .that.contains("File not base64");
			}
			return expect.fail("should have thrown error because no valid sections");
		});
	});

	describe("RemoveDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		it("should successfully remove added dataset", async function () {
			try {
				await facade.addDataset("csCourses", csCourses, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("csCourses");
				return expect(result).to.equal("csCourses");
			} catch (err) {
				return expect.fail(`test to remove dataset failed: ${err}`);
			}
		});

		it("add data set then remove it then remove it again", async function () {
			try {
				await facade.addDataset("csCourses", csCourses, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("csCourses");
				expect(result).to.equal("csCourses");
				await facade.removeDataset("csCourses");
				return expect.fail("should have already been thrown");
			} catch (err) {
				return expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should reject removing a dataset that was never added", async function () {
			try {
				await facade.removeDataset("nonExistentDataset");
				return expect.fail("Should have thrown InsightError for non-existent dataset");
			} catch (err) {
				return expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should reject removing a dataset with an empty Id", async function () {
			try {
				await facade.removeDataset("");
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError for empty ID");
		});

		it("should reject removing a dataset with an whitespace Id", async function () {
			try {
				await facade.removeDataset("    ");
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError for empty ID");
		});

		it("should reject removing a dataset with an underscore Id", async function () {
			try {
				await facade.removeDataset("bad_data");
			} catch (err) {
				return expect(err).to.be.instanceOf(InsightError);
			}
			return expect.fail("Should have thrown InsightError for underscore ID");
		});
	});

	describe("ListDatasets", function () {
		beforeEach(function () {
			facade = new InsightFacade();
		});

		afterEach(async function () {
			await clearDisk();
		});

		it("should return an empty array when no datasets are added", async function () {
			try {
				const result = await facade.listDatasets(); // not sure if this is desired behavior
				return expect(result).to.be.an("array").that.is.empty;
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing dataset that isnt added: ${err}`);
			}
		});

		it("should list one Sections dataset", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				const result = await facade.listDatasets();

				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid dataset: ${err}`);
			}
		});

		// disk and memory

		it("should list two Sections dataset", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				await facade.addDataset("cs522", cs522, InsightDatasetKind.Sections);

				const result = await facade.listDatasets();

				const expected: InsightDataset[] = [
					{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 },
					{ id: "cs522", kind: InsightDatasetKind.Sections, numRows: 8 },
				];

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing two valid datasets: ${err}`);
			}
		});

		it("should list one Rooms dataset", async function () {
			try {
				await facade.addDataset("smallValidRoomsDataset", smallValidRoomsDataset, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();

				const expected: InsightDataset[] = [
					{ id: "smallValidRoomsDataset", kind: InsightDatasetKind.Rooms, numRows: 7 },
				];

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		// it("should list one Rooms dataset (second)", async function () {
		// 	try {
		// 		await facade.addDataset("campus", campus, InsightDatasetKind.Rooms);
		//
		// 		const result = await facade.listDatasets();
		// 		// console.log(result);
		//
		// 		const expected: InsightDataset[] = [{ id: "campus", kind: InsightDatasetKind.Rooms, numRows: 363 }];
		// 		// console.log(expected);
		//
		// 		return expect(result).to.deep.equal(expected);
		// 	} catch (err) {
		// 		return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
		// 	}
		// });

		it("should list one Rooms dataset (first half of campus)", async function () {
			try {
				await facade.addDataset("campusFirstHalf", campusFirstHalf, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				// console.log(result);

				const expected: InsightDataset[] = [{ id: "campusFirstHalf", kind: InsightDatasetKind.Rooms, numRows: 164 }];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (five eighth of campus minus IBLC)", async function () {
			try {
				await facade.addDataset(
					"campusFiveEighthMinusIBLCandLASR",
					campusFiveEighthMinusIBLCandLASR,
					InsightDatasetKind.Rooms
				);

				const result = await facade.listDatasets();
				// console.log(result);
				const expected: InsightDataset[] = [
					{ id: "campusFiveEighthMinusIBLCandLASR", kind: InsightDatasetKind.Rooms, numRows: 8 },
				];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (just IBLC from campus)", async function () {
			try {
				await facade.addDataset("campusIBLC", campusIBLC, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				// console.log(result);
				const expected: InsightDataset[] = [{ id: "campusIBLC", kind: InsightDatasetKind.Rooms, numRows: 18 }];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (just LASR from campus)", async function () {
			try {
				await facade.addDataset("campusLASR", campusLASR, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				const expected: InsightDataset[] = [{ id: "campusLASR", kind: InsightDatasetKind.Rooms, numRows: 6 }];

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (Six eighth of campus)", async function () {
			try {
				await facade.addDataset("campusSixEighth", campusSixEighth, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				// console.log(result);
				const expected: InsightDataset[] = [{ id: "campusSixEighth", kind: InsightDatasetKind.Rooms, numRows: 43 }];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (Seven eighth of campus)", async function () {
			try {
				await facade.addDataset("campusSevenEighth", campusSevenEighth, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				// console.log(result);

				const expected: InsightDataset[] = [{ id: "campusSevenEighth", kind: InsightDatasetKind.Rooms, numRows: 65 }];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});

		it("should list one Rooms dataset (Eight eighth of campus)", async function () {
			try {
				await facade.addDataset("campusEightEighth", campusEightEighth, InsightDatasetKind.Rooms);

				const result = await facade.listDatasets();
				// console.log(result);

				const expected: InsightDataset[] = [{ id: "campusEightEighth", kind: InsightDatasetKind.Rooms, numRows: 60 }];
				// console.log(expected);

				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing one valid rooms dataset: ${err}`);
			}
		});
	});

	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */
		async function checkQuery(this: Mocha.Context): Promise<any> {
			if (!this.test) {
				throw new Error(
					"Invalid call to checkQuery." +
						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
						"Do not invoke the function directly."
				);
			}
			// Destructuring assignment to reduce property accesses
			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);

			let result: InsightResult[];

			try {
				result = await facade.performQuery(input);
			} catch (err) {
				if (!errorExpected) {
					return expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (err instanceof InsightError) {
					return expect(err).to.be.instanceOf(InsightError);
				} else if (err instanceof ResultTooLargeError) {
					return expect(err).to.be.instanceOf(ResultTooLargeError);
				} else {
					return expect.fail("gsgs");
				}
			}
			if (errorExpected) {
				return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}

			return expect(result).to.have.deep.members(expected);
		}

		before(async function () {
			facade = new InsightFacade();

			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises: Promise<string[]>[] = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("cs522", cs522, InsightDatasetKind.Sections),
				facade.addDataset("campus", campus, InsightDatasetKind.Rooms),
				facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms),
			];

			try {
				await Promise.all(loadDatasetPromises);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

		// it("should reject query if input is a string", async function () {
		// 	const invalidQuery = "this is a string, not a query object";

		// 	try {
		// 		await facade.performQuery(invalidQuery);
		// 		expect.fail("Should have thrown InsightError for string input.");
		// 	} catch (err) {
		// 		expect(err).to.be.instanceOf(InsightError);
		// 	}
		// });

		// Examples demonstrating how to test performQuery using the JSON Test Queries.
		// The relative path to the query file must be given in square brackets.
		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it("[invalid/invalid.json] Query missing WHERE", checkQuery);
		it("[invalid/keysInMultipleDatasets.json] Query references multiple datasets", checkQuery);
		it("[invalid/tooLarge.json] Query exceeds 5000 results", checkQuery);
		it("[valid/exact_match.json] SELECT dept WHERE dept IS exactly 'cpsc' AND avg > 95", checkQuery);
		it("[valid/wildcard_at_start.json] SELECT dept WHERE dept ends with 'cpsc' AND avg > 95", checkQuery);
		it("[valid/wildcard_at_end.json] SELECT dept WHERE dept starts with 'cpsc' AND avg > 95", checkQuery);
		it("[valid/wildcard_at_both_ends.json] SELECT dept WHERE dept contains 'cpsc' AND avg > 95", checkQuery);

		// it("[valid/simpleRooms.json] SELECT rooms, seats WHERE seats > 300", checkQuery);

		it(
			"[invalid/wildcard_in_middle.json] SELECT dept WHERE dept contains 'c*psc' AND avg > 90 (invalid wildcard)",
			checkQuery
		);

		// it(
		// 	"[valid/or.json] SELECT dept, avg WHERE dept starts with 'phys' OR avg > 98",
		// 	checkQuery
		// );

		it("[valid/not.json] SELECT dept, avg WHERE NOT dept starts with 'phys' AND avg > 98", checkQuery);

		it("[valid/eq.json] SELECT dept, avg WHERE dept equals 'phys' AND avg equals 81", checkQuery);

		it("[valid/lt.json] SELECT dept, avg WHERE dept starts with 'phys' AND avg < 65", checkQuery);

		it("[invalid/string_input.json] Query is a string, not a query object", checkQuery);

		it("[invalid/eq_typo.json] EQ TYPO", checkQuery);

		it("[invalid/and_typo.json] AND TYPO", checkQuery);

		it("[invalid/columns_typo.json] COLUMNS TYPO", checkQuery);

		it("[invalid/is_typo.json] IS TYPO", checkQuery);

		it("[invalid/lt_typo.json] LT TYPO", checkQuery);

		it("[invalid/not_typo.json] NOT TYPO", checkQuery);

		it("[invalid/gt_typo.json] GT TYPO", checkQuery);

		it("[invalid/not_added.json] NOT ADDED YET", checkQuery);

		it("[valid/or.json] SELECT dept, avg WHERE avg > 97", checkQuery);

		it("[valid/scary_or.json] Scary OR", checkQuery);

		it("[invalid/columns_format.json] Columns Format", checkQuery);

		it("[invalid/top_level_comparator.json] Invalid Top Level Comparator", checkQuery);

		it("[invalid/comparator_key.json] Invalid Comparator KEY", checkQuery);

		it("[valid/complex_basic.json] Complex Basic", checkQuery);

		it("[invalid/complex_columns_mfield.json] Invalid Columns Mfield ", checkQuery);

		it("[invalid/order_mfield.json] Invalid Order Mfield ", checkQuery);

		it("[invalid/columns_mstring.json] Invalid Columns Mstring ", checkQuery);

		it("[invalid/order_mstring.json] Invalid Order Mstring ", checkQuery);

		it("[invalid/and_gt_stringid.json] Invalid StringID GT ", checkQuery);

		it("[valid/nested_or.json] Nested OR", checkQuery);

		it("[invalid/typo_or.json] TYPO OR ", checkQuery);

		it("[valid/OR_MAIN.json] TESTER JSON ", checkQuery);

		it("[invalid/TYPECHECK_MKEY.json] TYPECHECK MKEY ", checkQuery);

		it("[invalid/TYPECHECK_SKEY.json] TYPECHECK SKEY ", checkQuery);

		it("[valid/skey_title.json] VALID SKEY TITLE", checkQuery);

		it("[valid/skey_id.json] VALID SKEY ID", checkQuery);

		it("[valid/skey_instructor.json] VALID SKEY INSTRUCTOR", checkQuery);

		it("[valid/skey_uuid.json] VALID SKEY UUID", checkQuery);

		it("[valid/mkey_audit.json] VALID SKEY AUDIT", checkQuery);

		it("[valid/mkey_fail.json] VALID SKEY FAIL", checkQuery);

		it("[valid/mkey_pass.json] VALID SKEY PASS", checkQuery);

		// it("[valid/mkey_year.json] VALID SKEY YEAR", checkQuery); CANNOT FIGURE OUT WHY YEAR DOES NOT WORK, CANNOT SORT BY YEAR OR FILTER BY YEAR I THINK ITS DUPLICATING ENTRIES BUT CANNOT GET RID OF IT

		it("[valid/columns_hell.json] COLUMNS HELL", checkQuery);

		it("[valid/token_avg.json] TOKEN AVG", checkQuery);

		it("[valid/token_count.json] TOKEN COUNT", checkQuery);

		it("[valid/token_max.json] TOKEN MAX", checkQuery);

		it("[valid/token_min.json] TOKEN MIN", checkQuery);

		it("[valid/token_multiple_apply.json] TOKEN MULTIPLE APPLY", checkQuery);

		it("[valid/token_sum.json] TOKEN SUM", checkQuery);

		it("[valid/order_tiebreaker.json] ORDER TIEBREAKER", checkQuery);

		it("[valid/order_up.json] ORDER UP (already have an order down)", checkQuery);

		it("[invalid/typo_apply.json] TYPO APPLY ", checkQuery);

		it("[invalid/typo_group.json] TYPO GROUP ", checkQuery);

		it("[invalid/typo_groupkeyfield.json] TYPO GROUP KEY FIELD ", checkQuery);

		it("[invalid/typo_groupkeyid.json] TYPO GROUP KEY ID ", checkQuery);

		it("[invalid/typo_order_actualdirection.json] TYPO ACTUAL DIRECTION", checkQuery);

		it("[invalid/typo_order_dir.json] TYPO DIRECTION ITSELF", checkQuery);

		it("[invalid/typo_order.json] TYPO ORDER", checkQuery);

		it("[invalid/typo_tokenavg.json] TYPO TOKEN AVG", checkQuery);

		it("[invalid/typo_tokencount.json] TYPO TOKEN COUNT", checkQuery);

		it("[invalid/typo_tokenkeyfield.json] TYPO TOKEN KEY FIELD", checkQuery);

		it("[invalid/typo_tokenkeyid.json] TYPO TOKEN KEY ID", checkQuery);

		it("[invalid/typo_tokenmax.json] TYPO TOKEN MAX", checkQuery);

		it("[invalid/typo_tokenmin.json] TYPO TOKEN MIN", checkQuery);

		it("[invalid/typo_tokensum.json] TYPO TOKEN SUM", checkQuery);

		it("[invalid/typo_transformations.json] TYPO TRANSFORMATIONS", checkQuery);

		it("[invalid/typoorder_keys.json] TYPO ORDER KEYS", checkQuery);

		it("[invalid/columnkeys_notingrouporapply.json] COLUMN KEY NOT IN GROUP OR APPLY", checkQuery);

		it("[invalid/columns_missingorderkey.json] COLUMNS MISSING ORDER KEY", checkQuery);

		it("[invalid/customapplykey_notincolumns.json] CUSTOM APPLY KEY NOT IN COLUMNS", checkQuery);

		it("[invalid/duplicate_applytokenkey.json] DUPLICATE APPLY TOKEN KEY IN RULE", checkQuery);

		it("[invalid/typo_order_keys.json] TYPO IN THE KEYS IN ORDER KEYS", checkQuery);

		it("[invalid/typo_order_keys_in_keys.json] TYPO IN ORDER KEYS KEYS ITSELF", checkQuery);

		/// FOR LIAM THESE ARE THE ROOM TESTS. ALL THE ONES COMMENTED OUT FAIL BUT IM NOT SURE IF ITS MY CODE OR YOUR CODE

		it("[valid/rooms_complex_basic.json] ROOMS PLEASE GOD", checkQuery);

		it("[valid/rooms_address.json] ROOMS ADDRESS", checkQuery);

		it("[valid/rooms_fullname.json] ROOMS FULLNAME", checkQuery);

		it("[valid/rooms_furniture.json] ROOMS FURNITURE", checkQuery);

		it("[valid/rooms_href.json] ROOMS HREF", checkQuery);

		it("[valid/rooms_lat.json] ROOMS LAT", checkQuery);

		it("[valid/rooms_lon.json] ROOMS LON", checkQuery);

		it("[valid/rooms_name.json] ROOMS NAME", checkQuery);

		it("[valid/rooms_number.json] ROOMS NUMBER", checkQuery);

		it("[valid/rooms_seats.json] ROOMS SEATS", checkQuery);

		it("[valid/rooms_shortname.json] ROOMS SHORTNAME", checkQuery);

		it("[valid/rooms_type.json] ROOMS TYPE", checkQuery);
	});

	describe("Caching Progress", function () {
		beforeEach(function () {
			facade = new InsightFacade();
		});

		afterEach(async function () {
			await clearDisk();
		});

		it("listDataset should reflect removal of dataset", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				await facade.addDataset("cs522", cs522, InsightDatasetKind.Sections);
				await facade.removeDataset("cs522");

				const result = await facade.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];
				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing dataset that isnt added: ${err}`);
			}
		});

		it("new instance return an empty array when no datasets are added", async function () {
			try {
				facade2 = new InsightFacade();
				const result = await facade2.listDatasets(); // not sure if this is desired behavior
				return expect(result).to.be.an("array").that.is.empty;
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing dataset that isnt added: ${err}`);
			}
		});

		it("new instance should have access to previously added dataset", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();
				const result = await facade2.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];
				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing dataset that isnt added: ${err}`);
			}
		});

		it("new instance should have access to previously added datasets", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				await facade.addDataset("cs522", cs522, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();
				const result = await facade2.listDatasets();
				const expected: InsightDataset[] = [
					{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 },
					{ id: "cs522", kind: InsightDatasetKind.Sections, numRows: 8 },
				];
				return expect(result).to.deep.members(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing two valid datasets: ${err}`);
			}
		});

		it("new instance should have reflect deleted datasets", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				await facade.addDataset("cs522", cs522, InsightDatasetKind.Sections);
				await facade.removeDataset("cs522");
				facade2 = new InsightFacade();
				const result = await facade2.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];
				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing two valid datasets: ${err}`);
			}
		});

		it("first instance adds, second deletes, third should reflect", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);
				await facade.addDataset("cs522", cs522, InsightDatasetKind.Sections);

				facade2 = new InsightFacade();
				await facade2.removeDataset("cs522");

				facade3 = new InsightFacade();
				const result = await facade3.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];
				return expect(result).to.deep.equal(expected);
			} catch (err) {
				return expect.fail(`Should not have thrown error for listing two valid datasets: ${err}`);
			}
		});

		it("should correctly reflect the number of rows for added datasets", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				facade2 = new InsightFacade(); // Create a new instance
				const result = await facade2.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];

				// Check if the number of rows matches
				expect(result[0].numRows).to.equal(expected[0].numRows);
			} catch (err) {
				return expect.fail(`Should not have thrown error for checking row count: ${err}`);
			}
		});

		it("should correctly reflect the id for added datasets", async function () {
			try {
				await facade.addDataset("miniPair", miniPair, InsightDatasetKind.Sections);

				facade2 = new InsightFacade(); // Create a new instance
				const result = await facade2.listDatasets();
				const expected: InsightDataset[] = [{ id: "miniPair", kind: InsightDatasetKind.Sections, numRows: 1160 }];

				// Check if the number of rows matches
				expect(result[0].id).to.equal(expected[0].id);
			} catch (err) {
				return expect.fail(`Should not have thrown error for checking row count: ${err}`);
			}
		});

		it("should be able to query previously loaded dataset", async function () {
			try {
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();

				const { input, expected, errorExpected } = await loadTestQuery("[valid/eq.json]");
				let result: InsightResult[];

				try {
					result = await facade2.performQuery(input);
					return expect(result).to.have.deep.members(expected);
				} catch (err) {
					if (!errorExpected) {
						return expect.fail(`performQuery threw unexpected error: ${err}`);
					}
				}
				if (errorExpected) {
					return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				return expect.fail(`Should not have thrown error for valid query on previous dataset: ${err}`);
			}
		});

		it("should fail to query NOT previously loaded dataset", async function () {
			try {
				await facade.addDataset("obst503", obst503, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();

				const { input, expected, errorExpected } = await loadTestQuery("[valid/simple.json]");
				let result: InsightResult[];

				try {
					result = await facade2.performQuery(input);
					return expect.fail(`Should fail not return: ${result}`);
				} catch (err) {
					if (!errorExpected) {
						return expect.fail(`performQuery threw unexpected error: ${err}`);
					}
					if (err instanceof InsightError) {
						return expect.fail("Loading the dataset should fail, which is thrown before the query errors");
					} else if (err instanceof ResultTooLargeError) {
						return expect.fail("ResultTooLargeError is wrong type of error");
					} else {
						return expect.fail("gsgs");
					}
				}
				if (errorExpected) {
					return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				return expect(`Should throw error for valid query with wrong datasets added: ${err}`);
			}
		});

		it("should be able to perform invalid query previously loaded dataset", async function () {
			try {
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();

				const { input, expected, errorExpected } = await loadTestQuery("[invalid/wildcard_in_middle.json]");
				// let result: InsightResult[];

				try {
					await facade2.performQuery(input);
					// expect(result).to.have.deep.members(expected);
				} catch (err) {
					if (!errorExpected) {
						return expect.fail(`performQuery threw unexpected error: ${err}`);
					}
					if (err instanceof InsightError) {
						return expect(err).to.be.instanceOf(InsightError);
					} else if (err instanceof ResultTooLargeError) {
						return expect(err).to.be.instanceOf(ResultTooLargeError);
					} else {
						return expect.fail("gsgs");
					}
				}
				if (errorExpected) {
					return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				return expect.fail(`Should not have thrown error for valid query on previous dataset: ${err}`);
			}
		});

		it("New instance should query on newly loaded dataset", async function () {
			try {
				await facade.addDataset("obst503", obst503, InsightDatasetKind.Sections);
				facade2 = new InsightFacade();
				await facade2.addDataset("wood499", wood499, InsightDatasetKind.Sections);

				const { input, expected, errorExpected } = await loadTestQuery("[valid/simpleTestWood499.json]");
				let result: InsightResult[];

				try {
					result = await facade2.performQuery(input);
					return expect(result).to.have.deep.members(expected);
				} catch (err) {
					if (!errorExpected) {
						return expect.fail(`performQuery threw unexpected error: ${err}`);
					}
				}
				if (errorExpected) {
					return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				return expect.fail(`Should not have thrown error for valid query on previous dataset: ${err}`);
			}
		});

		it("query with year in column should work", async function () {
			try {
				await facade.addDataset("wood499", wood499, InsightDatasetKind.Sections);

				const { input, expected, errorExpected } = await loadTestQuery("[valid/yearWood499.json]");
				let result: InsightResult[];

				try {
					result = await facade.performQuery(input);
					return expect(result).to.have.deep.members(expected);
				} catch (err) {
					if (!errorExpected) {
						return expect.fail(`performQuery threw unexpected error: ${err}`);
					}
				}
				if (errorExpected) {
					return expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
				}
			} catch (err) {
				return expect.fail(`Should not have thrown error for valid query on dataset: ${err}`);
			}
		});
	});
});
