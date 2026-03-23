import JSZip from "jszip";
import fs from "fs-extra";
import * as path from "path";
import * as parse5 from "parse5";
import { Section } from "./Section";
// import { Building } from "./Building";
import { Room } from "./Room";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import {
	ensureSingleDatasetReferenced,
	getDatasetIdFromColumns,
	handleIsFilter as externalHandleIsFilter,
	handleMComparator as externalHandleMComparator,
	formatResult as externalFormatResult,
	validateColumnKey as externalValidateColumnKey,
	applyOrder as externalApplyOrder,
	enforceFieldTypesHelpers,
} from "./helpers";

import {
	applyAggregateFunctions,
	groupByKeys,
	validateApplyRuleIds,
	validateOptionsStructure,
} from "./aggregationHelpers";

import {
	getDataDir,
	hasCoursesFolder,
	isAlreadyAdded,
	isBase64,
	isCorrectKind,
	isValidId,
	isZipFile,
} from "./validateDatasetHelpers";
import {
	loadMetaDataFromDisk,
	makeNewMetaData,
	saveMetadataToDisk,
	saveRoomsToDisk,
	saveSectionsDataToDisk,
	verifyAndLoadDataset,
} from "./cachingHelpers";
import { extractBuildingInfo, hasIndexFile, processRooms } from "./roomsProcessingHelpers";
import { getDataset } from "./getDatasetHelpers";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private metadata: Map<string, InsightDataset>; // Metadata (id, kind, numRows) for quick searching
	private sectionsDatasets: Map<string, Section[]>; // For actual sections data
	private roomsDatasets: Map<string, Room[]>;
	private loadingPromise: Promise<void>;

	constructor() {
		this.sectionsDatasets = new Map();
		this.metadata = new Map();
		this.roomsDatasets = new Map();
		this.loadingPromise = loadMetaDataFromDisk(this.metadata).catch((error) => {
			console.error(`Error loading metadata: ${error}`);
		});
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		await this.loadingPromise;
		isValidId(id);
		isCorrectKind(kind);
		isBase64(content);
		isZipFile(content);

		if (isAlreadyAdded(this.metadata, id)) {
			// console.log(`Dataset with id ${id} has already been added`);
			throw new InsightError(`Dataset with ID '${id}' already exists.`);
		}
		if (kind === InsightDatasetKind.Sections) {
			await this.processSectionDataset(id, content, kind);
		} else if (kind === InsightDatasetKind.Rooms) {
			await this.processRoomsDataset(id, content, kind);
		}
		return Array.from(this.metadata.keys());
	}

	private async processSectionDataset(id: string, content: string, kind: InsightDatasetKind): Promise<void> {
		try {
			const zip = new JSZip();
			const loadedZip = await zip.loadAsync(content, { base64: true });
			const processedSections = await this.processSectionsHelper(loadedZip);
			if (processedSections.length === 0) {
				throw new InsightError("No valid Sections found in dataset");
			}

			// Update in-memory structures (must be done before saving to Disk!)
			const newMetadata = makeNewMetaData(id, kind, processedSections);
			this.metadata.set(id, newMetadata);
			this.sectionsDatasets.set(id, processedSections);

			// Update Disk memory
			await saveMetadataToDisk(this.metadata);
			await saveSectionsDataToDisk(id, processedSections);
			return;
		} catch (err: any) {
			throw new InsightError(`Failed to add dataset: ${err.message}`);
		}
	}

	private async processRoomsDataset(id: string, content: string, kind: InsightDatasetKind): Promise<void> {
		try {
			const zip = new JSZip();
			const loadedZip = await zip.loadAsync(content, { base64: true });

			// Find and extract the index.htm file
			const indexFile = hasIndexFile(loadedZip);
			const indexFileData = await indexFile.async("text");

			// Parse the index.htm file for building information
			const parsedDocument = parse5.parse(indexFileData);
			const buildingEntries = extractBuildingInfo(parsedDocument);

			// For each building in building[], parse its room information and return all as a Room[]
			const processedRooms = await processRooms(buildingEntries, loadedZip);

			if (processedRooms.length === 0) {
				throw new InsightError("No valid rooms found in dataset.");
			}

			// Update in-memory structures (must be done before saving to Disk!)
			const newMetadata = makeNewMetaData(id, kind, processedRooms);
			this.metadata.set(id, newMetadata);
			this.roomsDatasets.set(id, processedRooms);
			// Update Disk memory
			await saveMetadataToDisk(this.metadata);
			await saveRoomsToDisk(id, processedRooms);
			return;
		} catch (err: any) {
			throw new InsightError(`Failed to add dataset: ${err.message}`);
		}
	}

	// addDataset helper function to process the dataset and returns an array of valid Sections
	// forEach loop 
	private async processSectionsHelper(zip: JSZip): Promise<Section[]> {
		const sections: Section[] = [];
		const filePromises: Promise<void>[] = [];

		// Check if the dataset has a folder called courses
		const courseFolder = hasCoursesFolder(zip);

		courseFolder.forEach((_relativePath, file) => {
			const filePromise = file.async("text").then((fileData) => {
				try {
					const results = JSON.parse(fileData).result;

					// Process each section in the 'result' array
					for (const sectionData of results) {
						if (this.hasAllRequiredFields(sectionData)) {
							let overallTrue = false;
							if (sectionData.Section === "overall") {
								overallTrue = true;
							}

							const section = this.makeSection(sectionData, overallTrue);
							sections.push(section);
						} else {
							// Log or skip the invalid section if it doesn't contain all the required fields
						}
					}
				} catch (_error) {
					// Do not want to throw an Error since the other sections may still be valid
					
				}
			});
			filePromises.push(filePromise);
		});

		await Promise.all(filePromises);
		return sections;
	}

	// Helper function to check if all required fields are present in sectionData
	private hasAllRequiredFields(sectionData: any): boolean {
		const requiredFields = ["id", "Professor", "Title", "Subject", "Course", "Avg", "Pass", "Fail", "Audit", "Year"];
		return requiredFields.every((field) => sectionData[field] !== undefined);
	}

	// Helper function to make a section object
	private makeSection(sectionData: any, overallTrue: boolean): Section {
		const OVERALL = 1900;
		// const { id, Professor, Title, Subject, Course, Avg, Pass, Fail, Audit, Year} = sectionData;
		if (overallTrue) {
			sectionData.Year = OVERALL;
		}
		const newSection = new Section(
			String(sectionData.id),
			sectionData.Professor,
			sectionData.Title,
			sectionData.Subject,
			sectionData.Course,
			sectionData.Avg,
			sectionData.Pass,
			sectionData.Fail,
			sectionData.Audit,
			sectionData.Year
		);
		return newSection;

		
	}

	public async removeDataset(id: string): Promise<string> {
		await this.loadingPromise;

		isValidId(id);
		//  Check if the dataset exists in memory
		if (!isAlreadyAdded(this.metadata, id)) {
			throw new NotFoundError(`Dataset with ID '${id}' not found.`);
		}

		try {
			// Remove the dataset from Disk
			const datasetFilePath = path.join(getDataDir(), `${id}.json`);
			await fs.remove(datasetFilePath);
		} catch (error) {
			throw new InsightError(`Failed to remove dataset from disk: ${(error as Error).message}`);
		}
		// Remove the dataset from memory
		this.metadata.delete(id);
		if (this.metadata.get(id)?.kind === InsightDatasetKind.Rooms) {
			this.roomsDatasets.delete(id);
		} else {
			this.sectionsDatasets.delete(id);
		}

		// Save the updated metadata to disk
		await saveMetadataToDisk(this.metadata);

		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		await this.loadingPromise;

		const { WHERE, TRANSFORMATIONS, COLUMNS, ORDER } = this.validateAndExtractQueryComponents(query);

		if (!TRANSFORMATIONS) {
			COLUMNS.forEach((column: string) => {
				externalValidateColumnKey(column);
			});
		}

		const datasetId = getDatasetIdFromColumns(COLUMNS);

		// Ensure dataset exists and loads it into memory
		await verifyAndLoadDataset(datasetId, this.metadata, this.sectionsDatasets, this.roomsDatasets);
		const dataset = getDataset(datasetId, this.metadata, this.sectionsDatasets, this.roomsDatasets)!;

		enforceFieldTypesHelpers(dataset);

		ensureSingleDatasetReferenced(COLUMNS, datasetId, TRANSFORMATIONS);

		let filteredData: InsightResult[] = this.applyWhereClause(WHERE, dataset, datasetId);

		if (TRANSFORMATIONS) {
			const { GROUP, APPLY } = TRANSFORMATIONS;
			const groupedData = groupByKeys(filteredData, GROUP);
			filteredData = applyAggregateFunctions(groupedData, APPLY, GROUP);
		}

		const result = externalFormatResult(filteredData, COLUMNS);

		if (ORDER) {
			externalApplyOrder(result, ORDER, COLUMNS);
		}

		const maxResults = 5000;
		if (result.length > maxResults) {
			throw new ResultTooLargeError("Result exceeds 5000 rows.");
		}
		return result;
	}

	private applyWhereClause(where: any, dataset: any[], datasetId: string): any[] {
		if (Object.keys(where).length === 0) {
			return dataset;
		}

		if (where.AND) {
			return this.handleAndFilter(where.AND, dataset, datasetId);
		} else if (where.OR) {
			return this.handleOrFilter(where.OR, dataset, datasetId);
		} else if (where.NOT) {
			return this.handleNotFilter(where.NOT, dataset, datasetId);
		} else if (where.IS) {
			return externalHandleIsFilter(where.IS, dataset);
		} else if (where.GT || where.LT || where.EQ) {
			return externalHandleMComparator(where, dataset, datasetId);
		} else {
			throw new InsightError("Invalid WHERE clause.");
		}
	}

	private handleAndFilter(filters: any[], dataset: any[], datasetID: string): any[] {
		return filters.reduce((result, filter) => this.applyWhereClause(filter, result, datasetID), dataset);
	}

	private handleOrFilter(filters: any[], dataset: any[], datasetID: string): any[] {
		const resultSet = new Set<string>();
		const uniqueResults: Section[] = [];

		for (const filter of filters) {
			const filtered = this.applyWhereClause(filter, dataset, datasetID);

			for (const section of filtered) {
				const sectionString = JSON.stringify(section);

				if (!resultSet.has(sectionString)) {
					resultSet.add(sectionString);
					uniqueResults.push(section);
				}
			}
		}

		return uniqueResults;
	}

	private handleNotFilter(filter: any, dataset: any[], datasetID: string): any[] {
		const included = this.applyWhereClause(filter, dataset, datasetID);
		return dataset.filter((section) => !included.includes(section));
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		await this.loadingPromise;
		return Array.from(this.metadata.values());
	}

	private validateAndExtractQueryComponents(query: unknown): {
		WHERE: any;
		OPTIONS: any;
		TRANSFORMATIONS: any;
		COLUMNS: string[];
		ORDER: any;
	} {
		if (typeof query !== "object" || query === null) {
			throw new InsightError("Query must be a non-null object.");
		}

		const { WHERE, OPTIONS, TRANSFORMATIONS } = query as any;

		if (typeof WHERE !== "object" || WHERE === null || typeof OPTIONS !== "object" || OPTIONS === null) {
			throw new InsightError("Query must contain valid WHERE and OPTIONS blocks.");
		}

		const { COLUMNS, ORDER } = OPTIONS;
		if (!Array.isArray(COLUMNS) || COLUMNS.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array.");
		}

		validateOptionsStructure(OPTIONS, COLUMNS);

		if (TRANSFORMATIONS) {
			const { GROUP, APPLY } = TRANSFORMATIONS;
			if (!Array.isArray(GROUP) || GROUP.length === 0 || !Array.isArray(APPLY)) {
				throw new InsightError("TRANSFORMATIONS must contain both GROUP and APPLY.");
			}

			validateApplyRuleIds(APPLY, GROUP[0].split("_")[0]);
		}

		return { WHERE, OPTIONS, TRANSFORMATIONS, COLUMNS, ORDER };
	}
}