import { InsightResult, InsightError } from "./IInsightFacade";

export function getDatasetIdFromColumns(columns: string[]): string {
	if (!columns || columns.length === 0 || typeof columns[0] !== "string" || !columns[0].includes("_")) {
		throw new InsightError("Invalid column format: expected datasetId_field.");
	}
	const parts = columns[0].split("_");
	const correctLength = 2;
	if (parts.length !== correctLength) {
		throw new InsightError("Invalid key format in COLUMNS.");
	}
	return parts[0]; // return the dataset ID
}

export function ensureSingleDatasetReferenced(
	columns: string[],
	expectedDatasetId: string,
	transformations?: any
): void {
	if (!transformations) {
		return;
	}

	const groupKeys = new Set<string>(transformations.GROUP as string[]);
	const applyKeys = new Set<string>(transformations.APPLY.map((rule: any) => Object.keys(rule)[0] as string));

	for (const column of columns) {
		validateColumnInTransformations(column, expectedDatasetId, groupKeys, applyKeys);
	}
}

function validateColumnInTransformations(
	column: string,
	expectedDatasetId: string,
	groupKeys: Set<string>,
	applyKeys: Set<string>
): void {
	const [datasetId] = column.split("_");

	// Check if column is in GROUP or APPLY
	if (!groupKeys.has(column) && !applyKeys.has(column)) {
		throw new InsightError(`Invalid column in COLUMNS: ${column}. Must be in GROUP or APPLY.`);
	}

	// Check if it has the correct dataset ID or if it is an APPLY key
	const isStandardColumn = datasetId === expectedDatasetId;
	const isApplyKey = applyKeys.has(column);

	if (!isStandardColumn && !isApplyKey) {
		throw new InsightError(`Unexpected key format in COLUMNS: ${column}`);
	}
}

export function handleIsFilter(isFilter: any, dataset: any[]): any[] {
	const key = Object.keys(isFilter)[0];
	const value = isFilter[key];

	const parts = key.split("_");
	const correctLength = 2;
	if (parts.length !== correctLength) {
		throw new InsightError("Invalid key format in IS filter.");
	}

	const field = parts[1];
	const validSFieldsPart1 = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname"];

	const validSFieldsPart2 = ["number", "name", "address", "type", "furniture", "href"];

	const validSFields = [...validSFieldsPart1, ...validSFieldsPart2];

	// Check if the field is valid based on the EBNF definition.
	if (!validSFields.includes(field)) {
		throw new InsightError(`Invalid S field: ${field}`);
	}

	if (typeof value !== "string") {
		throw new InsightError(`Expected a string for field '${field}', but got ${typeof value}`);
	}

	const middleWildcard = /[^*].*\*.*[^*]/;
	if (middleWildcard.test(value)) {
		throw new InsightError("Invalid wildcard pattern: Wildcards are only allowed at the start or end of the string.");
	}
	
	const regex = new RegExp(`^${value.replace(/\*/g, ".*")}$`);
	return dataset.filter((item) => regex.test((item as any)[field]));
}

export function handleMComparator(mComparator: any, dataset: any[], datasetId: string): any[] {
	const comparatorType = Object.keys(mComparator)[0]; // GT, LT, or EQ
	const key = Object.keys(mComparator[comparatorType])[0];
	const value = mComparator[comparatorType][key];
	const parts = key.split("_");

	const correctLength = 2;
	if (parts.length !== correctLength) {
		throw new InsightError("Invalid key format in MComparator.");
	}

	const idString = parts[0];
	const field = parts[1];

	if (idString !== datasetId) {
		throw new InsightError(`Invalid dataset ID '${idString}' in MComparator. Expected '${datasetId}'.`);
	}

	const validMFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

	// Check if the field is valid!!!!
	if (!validMFields.includes(field)) {
		throw new InsightError(`Invalid M field: ${field}`);
	}

	// Validate if the field exists in the dataset by checking the first item!!!!!
	if (!dataset.length || !(field in dataset[0])) {
		throw new InsightError(`Field '${field}' does not exist in the dataset.`);
	}

	if (typeof value !== "number") {
		throw new InsightError(`Expected a number for field '${field}', but got ${typeof value}`);
	}

	if (comparatorType === "GT") {
		return dataset.filter((item) => (item as any)[field] > value);
	} else if (comparatorType === "LT") {
		return dataset.filter((item) => (item as any)[field] < value);
	} else {
		return dataset.filter((item) => (item as any)[field] === value);
	}
}

export function formatResult(filteredSections: any[], columns: string[]): InsightResult[] {
	return filteredSections.map((item) => {
		const result: InsightResult = {};

		for (const column of columns) {
			if (!column || typeof column !== "string") {
				throw new InsightError("Invalid column format in COLUMNS from format result.");
			}

			// If column has '_', it's a dataset field (e.g., "sections_instructor")
			if (column.includes("_")) {
				const [datasetPrefix, field] = column.split("_");

				// Check if item contains the prefixed or unprefixed field
				if (Object.prototype.hasOwnProperty.call(item, column)) {
					result[column] = item[column];
				} else if (Object.prototype.hasOwnProperty.call(item, field)) {
					result[column] = item[field];
				} else {
					throw new InsightError(`Field '${field}' is missing in dataset item. '${datasetPrefix}'`);
				}
			} else {
				// Assume it's an apply key and check in item
				if (!(column in item)) {
					throw new InsightError(`Apply key '${column}' not found in result item.`);
				}
				result[column] = item[column];
			}
		}
		return result;
	});
}

export function applyOrder(
	result: InsightResult[],
	order: string | { dir: string; keys: string[] },
	columns: string[]
): void {
	// Made with help of gen AI
	if (typeof order === "string") {
		// Single column order
		if (!columns.includes(order)) {
			throw new InsightError(`ORDER key '${order}' is not found in COLUMNS.`);
		}
		result.sort((a, b) => (a[order] < b[order] ? -1 : a[order] > b[order] ? 1 : 0));
	} else if (typeof order === "object" && order.dir && Array.isArray(order.keys)) {
		// Multiple columns with direction

		const { dir, keys } = order;

		if (dir !== "UP" && dir !== "DOWN") {
			throw new InsightError(`Invalid ORDER direction: ${dir}`);
		}

		keys.forEach((key) => {
			if (!columns.includes(key)) {
				throw new InsightError(`ORDER key '${key}' is not found in COLUMNS.`);
			}
		});

		result.sort((a, b) => {
			for (const key of keys) {
				if (a[key] < b[key]) {
					return dir === "UP" ? -1 : 1;
				}
				if (a[key] > b[key]) {
					return dir === "UP" ? 1 : -1;
				}
			}
			return 0;
		});
	} else {
		throw new InsightError("Invalid ORDER format");
	}
}

export function validateColumnKey(column: string): void {
	const parts = column.split("_");
	const correctLength = 2;

	if (parts.length !== correctLength) {
		throw new InsightError("Invalid key format in COLUMNS.");
	}

	const validSFields = [
		"dept",
		"id",
		"instructor",
		"title",
		"uuid",
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"type",
		"furniture",
		"href",
	];
	const validMFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
	const field = parts[1];

	if (!validSFields.includes(field) && !validMFields.includes(field)) {
		throw new InsightError(`Invalid field in COLUMNS: ${field}`);
	}
}

export function enforceFieldTypesHelpers(dataset: any[]): void {
	dataset.forEach((item) => {
		// Fields common to Sections
		item.uuid = typeof item.uuid === "string" ? item.uuid : String(item.uuid);
		item.instructor = typeof item.instructor === "string" ? item.instructor : String(item.instructor);
		item.title = typeof item.title === "string" ? item.title : String(item.title);
		item.dept = typeof item.dept === "string" ? item.dept : String(item.dept);
		item.id = typeof item.id === "string" ? item.id : String(item.id);
		item.avg = typeof item.avg === "number" ? item.avg : Number(item.avg);
		item.pass = typeof item.pass === "number" ? item.pass : Number(item.pass);
		item.fail = typeof item.fail === "number" ? item.fail : Number(item.fail);
		item.audit = typeof item.audit === "number" ? item.audit : Number(item.audit);
		item.year = typeof item.year === "number" ? item.year : Number(item.year);

		// Fields specific to Rooms
		item.fullname = typeof item.fullname === "string" ? item.fullname : String(item.fullname);
		item.shortname = typeof item.shortname === "string" ? item.shortname : String(item.shortname);
		item.number = typeof item.number === "string" ? item.number : String(item.number);
		item.name = typeof item.name === "string" ? item.name : String(item.name);
		item.address = typeof item.address === "string" ? item.address : String(item.address);
		item.lat = typeof item.lat === "number" ? item.lat : Number(item.lat);
		item.lon = typeof item.lon === "number" ? item.lon : Number(item.lon);
		item.seats = typeof item.seats === "number" ? item.seats : Number(item.seats);
		item.type = typeof item.type === "string" ? item.type : String(item.type);
		item.furniture = typeof item.furniture === "string" ? item.furniture : String(item.furniture);
		item.href = typeof item.href === "string" ? item.href : String(item.href);
	});
}