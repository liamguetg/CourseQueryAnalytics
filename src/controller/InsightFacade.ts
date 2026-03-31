import { Section } from "./Section";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import { FIXED_PORTFOLIO_DATASET_ID } from "./fixedPortfolioDataset";
import {
	ensureSingleDatasetReferenced,
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
import { loadMetaDataFromDisk, verifyAndLoadDataset } from "./cachingHelpers";
import { getDataset } from "./getDatasetHelpers";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private metadata: Map<string, InsightDataset>; // Metadata (id, kind, numRows) for quick searching
	private sectionsDatasets: Map<string, Section[]>; // For actual sections data
	private loadingPromise: Promise<void>;

	constructor() {
		this.sectionsDatasets = new Map();
		this.metadata = new Map();
		// this.roomsDatasets = new Map();
		this.loadingPromise = loadMetaDataFromDisk(this.metadata).catch((error) => {
			console.error(`Error loading metadata: ${error}`);
		});
	}

	public async addDataset(_id: string, _content: string, _kind: InsightDatasetKind): Promise<string[]> {
		await this.loadingPromise;
		throw new InsightError("Dataset upload is disabled in this deployment.");
	}

	public async removeDataset(_id: string): Promise<string> {
		await this.loadingPromise;
		throw new InsightError("Dataset removal is disabled in this deployment.");
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		await this.loadingPromise;

		const { WHERE, TRANSFORMATIONS, COLUMNS, ORDER } = this.validateAndExtractQueryComponents(query);

		if (!TRANSFORMATIONS) {
			COLUMNS.forEach((column: string) => {
				externalValidateColumnKey(column);
			});
		}

		const datasetId = FIXED_PORTFOLIO_DATASET_ID;

		// Load rows from disk into memory on first use (startup only restores metadata).
		await verifyAndLoadDataset(datasetId, this.metadata, this.sectionsDatasets);
		const dataset = getDataset(datasetId, this.metadata, this.sectionsDatasets)!;

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
