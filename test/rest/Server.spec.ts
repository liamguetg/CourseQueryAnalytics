import { expect } from "chai";
import request, { Response } from "supertest";
import { StatusCodes } from "http-status-codes";
import Log from "@ubccpsc310/folder-test/build/Log";
import * as fs from "fs";
import * as path from "path";
import Server from "../../src/rest/Server";

describe("Facade C3", function () {
	let server: Server;
	const port = 4321;
	const SERVER_URL = `http://localhost:${port}`;

	before(async function () {
		// TODO: start server here once and handle errors properly
		server = new Server(port);
		try {
			await server.start();
			Log.info("Server started successfully.");
		} catch (err) {
			Log.error(`Failed to start server: ${err}`);
		}
	});

	after(async function () {
		// TODO: stop server here once!
		try {
			await server.stop();
			Log.info("Server stopped successfully.");
		} catch (err) {
			Log.error(`Failed to stop server: ${err}`);
		}
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	describe("PUT /dataset/:id/:kind", function () {
		it("PUT test for valid courses dataset", async function () {
			const ENDPOINT_URL = "/dataset/tioy/sections";
			const ZIP_FILE_PATH = path.join(__dirname, "../resources/archives/phys_courses.zip");

			try {
				const ZIP_FILE_DATA = await fs.promises.readFile(ZIP_FILE_PATH);
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						Log.info("Received successful response for valid dataset.");
						console.log("Response status:", res.status);
						console.log("Response body:", res.body);
						expect(res.status).to.be.equal(StatusCodes.OK);
						expect(res.body).to.have.property("result").that.is.an("array");
					})
					.catch(function () {
						Log.error("Expected success but request failed.");
						expect.fail();
					});
			} catch (err) {
				Log.error(err);
				expect.fail("Failed to read ZIP file");
			}
		});

		it("PUT test for invalid dataset content", async function () {
			const ENDPOINT_URL = "/dataset/courses/sections";
			const ZIP_FILE_PATH = path.join(__dirname, "../resources/archives/notBase64.zip");

			try {
				const ZIP_FILE_DATA = await fs.promises.readFile(ZIP_FILE_PATH);
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						Log.info("Received response for invalid dataset content.");
						console.log("Response status:", res.status);
						console.log("Response body:", res.body);
						expect(res.status).to.be.equal(StatusCodes.BAD_REQUEST);
						expect(res.body).to.have.property("error").that.is.a("string");
					})
					.catch(function () {
						Log.error("Expected failure for invalid dataset content but request succeeded.");
						expect.fail();
					});
			} catch (err) {
				Log.error(err);
				expect.fail("Failed to read ZIP file");
			}
		});
	});

	describe("DELETE /dataset/:id", function () {
		it("should delete an existing dataset successfully", async function () {
			const id = "deleteDatasetSuccess";
			const ENDPOINT_URL = `/dataset/${id}/sections`;
			const ZIP_FILE_PATH = path.join(__dirname, "../resources/archives/phys_courses.zip");

			try {
				const ZIP_FILE_DATA = await fs.promises.readFile(ZIP_FILE_PATH);

				// First, add the dataset
				await request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.expect(StatusCodes.OK);

				// Then, delete the dataset
				await request(SERVER_URL)
					.delete(`/dataset/${id}`)
					.expect(StatusCodes.OK)
					.then(function (res: Response) {
						expect(res.body).to.have.property("result").that.equals(id);
					});
			} catch (err) {
				Log.error(err);
				expect.fail("Failed to read ZIP file");
			}
		});

		it("should return 404 when deleting a non-existent dataset", async function () {
			const id = "nonExistent";

			await request(SERVER_URL)
				.delete(`/dataset/${id}`)
				.expect(StatusCodes.NOT_FOUND)
				.then(function (res: Response) {
					expect(res.body).to.have.property("error").that.is.a("string");
				});
		});

		it("should return 400 for an invalid dataset ID", async function () {
			const invalidId = "invalid_id_with_underscore";

			await request(SERVER_URL)
				.delete(`/dataset/${invalidId}`)
				.expect(StatusCodes.BAD_REQUEST)
				.then(function (res: Response) {
					expect(res.body).to.have.property("error").that.is.a("string");
				});
		});
	});

	describe("GET /datasets", function () {
		it("should return added datasets", async function () {
			const datasetId = "sampleDataset";
			const ENDPOINT_URL = `/dataset/${datasetId}/sections`;
			const ZIP_FILE_PATH = path.join(__dirname, "../resources/archives/phys_courses.zip");

			try {
				const ZIP_FILE_DATA = await fs.promises.readFile(ZIP_FILE_PATH);

				await request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.expect(StatusCodes.OK);

				await request(SERVER_URL)
					.get("/datasets")
					.expect(StatusCodes.OK)
					.then((res: Response) => {
						expect(res.body).to.have.property("result").that.is.an("array");
						const datasets = res.body.result;
						const datasetIds = datasets.map((dataset: { id: string }) => dataset.id);
						expect(datasetIds).to.include(datasetId);
					});
			} catch (err) {
				Log.error(err);
				expect.fail("Failed to add dataset or fetch datasets.");
			}
		});
	});

	// The other endpoints work similarly. You should be able to find all instructions in the supertest documentation
});
