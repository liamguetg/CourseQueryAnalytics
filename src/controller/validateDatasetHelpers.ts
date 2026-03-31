import path from "path";
// import { InsightDataset, InsightDatasetKind, InsightError } from "./IInsightFacade";
// import JSZip from "jszip";

// Returns file path for data directory (where databases are stored)
export function getDataDir(): string {
	return path.join(__dirname, "../../data");
}

// Returns file path for metadata file saved on Disk
export function getDiskMetadataPath(): string {
	return path.join(getDataDir(), "metadata.json");
}
