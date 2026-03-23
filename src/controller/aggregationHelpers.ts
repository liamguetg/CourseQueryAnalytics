import { InsightResult, InsightError } from "./IInsightFacade";
import Decimal from "decimal.js";

export function applyAggregateFunctions(
	groupedData: Map<string, any[]>,
	applyRules: any[],
	groupKeys: string[]
): InsightResult[] {
	const results: InsightResult[] = [];
	const validatedApplyRules = validateAndExtractApplyRules(applyRules);

	groupedData.forEach((group) => {
		const result = initializeGroupResult(group, groupKeys);

		validatedApplyRules.forEach(({ applyKey, APPLYTOKEN, datasetField }) => {
			applyRuleToGroup(group, applyKey, APPLYTOKEN, datasetField, result);
		});

		results.push(result);
	});

	return results;
}

function validateAndExtractApplyRules(
	applyRules: any[]
): { applyKey: string; APPLYTOKEN: string; datasetField: string }[] {
	const seenApplyKeys = new Set<string>();
	const validNumericFields = new Set(["avg", "pass", "fail", "audit", "year", "seats", "lat", "lon"]);
	const validatedRules: { applyKey: string; APPLYTOKEN: string; datasetField: string }[] = [];

	applyRules.forEach((rule, index) => {
		const applyKey = Object.keys(rule)[0];
		console.log(`Processing applyRule at index ${index}:`, rule);

		if (!applyKey || typeof rule[applyKey] !== "object") {
			throw new InsightError("Invalid APPLY rule structure.");
		}

		const applyDetails = rule[applyKey];

		if (seenApplyKeys.has(applyKey)) {
			throw new InsightError(`Duplicate applyKey found in APPLY: ${applyKey}`);
		}
		seenApplyKeys.add(applyKey);

		const APPLYTOKEN = Object.keys(applyDetails)[0];
		const KEY = applyDetails[APPLYTOKEN];

		if (!APPLYTOKEN || !KEY) {
			throw new InsightError(`Invalid APPLY rule structure or missing APPLYTOKEN/KEY in ${applyKey}`);
		}

		// Validate KEY format and ensure it exists in columns
		if (typeof KEY !== "string" || !KEY.includes("_")) {
			throw new InsightError(`Invalid or non-existent key in APPLY rule: ${KEY}`);
		}

		const [datasetId, field] = KEY.split("_");

		if (["MAX", "MIN", "AVG", "SUM"].includes(APPLYTOKEN) && !validNumericFields.has(field)) {
			throw new InsightError(
				`Field '${field}' is not numeric but required for '${APPLYTOKEN} in dataset '${datasetId}'`
			);
		}

		// Accumulate validated rules
		validatedRules.push({ applyKey, APPLYTOKEN, datasetField: field });
	});

	return validatedRules;
}

function initializeGroupResult(group: any[], groupKeys: string[]): InsightResult {
	const result: InsightResult = {};

	const correctParts = 2;

	groupKeys.forEach((gk) => {
		if (!gk || gk.split("_").length < correctParts || !group.length) {
			throw new InsightError("Invalid group key or empty group in transformation.");
		}
		result[gk] = group[0][gk.split("_")[1]];
	});

	return result;
}

function applyRuleToGroup(
	group: any[],
	applyKey: string,
	applyToken: string,
	field: string,
	result: InsightResult
): void {
	const values = group.map((g) => g[field]);
	const precision = 2;

	result[applyKey] = calculateApplyToken(values, applyToken, precision);
}

function calculateApplyToken(values: number[], applyToken: string, precision: number): number {
	switch (applyToken) {
		case "MAX": {
			return Math.max(...values);
		}
		case "MIN": {
			return Math.min(...values);
		}
		case "SUM": {
			return parseFloat(values.reduce((sum, val) => sum + val, 0).toFixed(precision));
		}
		case "AVG": {
			const total = values.reduce((sum, val) => sum.add(new Decimal(val)), new Decimal(0));
			return Number((total.toNumber() / values.length).toFixed(precision));
		}
		case "COUNT": {
			return new Set(values).size;
		}
		default: {
			throw new InsightError("Invalid APPLYTOKEN.");
		}
	}
}

export function groupByKeys(data: any[], groupKeys: string[]): Map<string, any[]> {
	const groupedData = new Map<string, any[]>();

	data.forEach((item) => {
		const groupKey = groupKeys
			.map((key) =>
				item[key.split("_")[1]] === undefined || item[key.split("_")[1]] === "" ? "" : item[key.split("_")[1]]
			)
			.join("-");

		if (!groupedData.has(groupKey)) {
			groupedData.set(groupKey, []);
		}
		groupedData.get(groupKey)!.push(item);
	});

	// console.log("Grouped Data with Empty Handling:", Array.from(groupedData.entries()));
	return groupedData;
}

export function validateOptionsStructure(OPTIONS: any, COLUMNS: string[]): void {
	const optionsKeys = Object.keys(OPTIONS);

	if (optionsKeys.length > 1 && optionsKeys[1] !== "ORDER") {
		throw new InsightError(`Expected 'ORDER' as the second key, but found '${optionsKeys[1]}' instead.`);
	}

	if (OPTIONS.ORDER !== undefined) {
		validateOrder(OPTIONS.ORDER, COLUMNS);
	}
}

export function validateApplyRuleIds(applyRules: any[], expectedDatasetId: string): void {
	applyRules.forEach((rule: any) => {
		const applyKey = Object.keys(rule)[0];
		const applyDetails = rule[applyKey];
		const APPLYTOKEN = Object.keys(applyDetails)[0];
		const KEY = applyDetails[APPLYTOKEN];

		if (typeof KEY === "string" && KEY.split("_")[0] !== expectedDatasetId) {
			throw new InsightError(`ID in APPLY rule '${KEY}' does not match '${expectedDatasetId}'`);
		}
	});
}

export function validateOrder(ORDER: any, columns: string[]): void {
	if (typeof ORDER !== "string" && (typeof ORDER !== "object" || !ORDER.dir || !Array.isArray(ORDER.keys))) {
		throw new InsightError("ORDER must be a valid key or an object with 'dir' and 'keys'.");
	}

	if (typeof ORDER === "object" && !["UP", "DOWN"].includes(ORDER.dir)) {
		throw new InsightError(`Invalid direction '${ORDER.dir}' in ORDER.`);
	}

	if (typeof ORDER === "string" && !columns.includes(ORDER)) {
		throw new InsightError(`ORDER key '${ORDER}' is not found in COLUMNS.`);
	}

	if (typeof ORDER === "object") {
		for (const key of ORDER.keys) {
			if (!columns.includes(key)) {
				throw new InsightError(`ORDER key '${key}' is not found in COLUMNS.`);
			}
		}
	}
}
