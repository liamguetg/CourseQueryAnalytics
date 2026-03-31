import * as fs from "fs-extra";
import * as path from "path";
import { getDataDir, getDiskMetadataPath } from "./validateDatasetHelpers";
import { Section } from "./Section";
import { InsightDataset, InsightDatasetKind, InsightError } from "./IInsightFacade";

// Function to get the path to the dataset file
function getDatasetFilePath(id: string): string {
	return path.join(getDataDir(), `${id}.json`); // Assuming datasets are stored as JSON files named after their IDs
}

// verifies that the dataset has been added (either in memory or on disk) and loads it into memory if needed
export async function verifyAndLoadDataset(
	id: string,
	metadata: Map<string, InsightDataset>,
	sectionsDataset: Map<string, Section[]>
	// roomsDataset: Map<string, Room[]>
): Promise<void> {
	if (!metadata.has(id)) {
		throw new InsightError(`Dataset with id '${id}' does not exist.`);
	}
	if (metadata.has(id)) {
		if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
			if (!sectionsDataset.has(id)) {
				await loadSectionDatasetFromDisk(id, sectionsDataset);
			} else if (sectionsDataset.has(id)) {
				return;
			}
		}
		// else if (metadata.get(id)?.kind === InsightDatasetKind.Rooms) {
		// 	if (!roomsDataset.has(id)) {
		// 		await loadRoomsDatasetFromDisk(id, roomsDataset);
		// 	} else if (roomsDataset.has(id)) {
		// 		return;
		// 	}
		// }
	}
}

// Function to load a SectionsDataset by ID into memory
export async function loadSectionDatasetFromDisk(id: string, datasets: Map<string, Section[]>): Promise<void> {
	try {
		const datasetFilePath = getDatasetFilePath(id);

		// Read the dataset file content
		const fileContent = await fs.readFile(datasetFilePath, "utf8");

		// Parse the JSON content into an array of sections
		const sections: Section[] = JSON.parse(fileContent);

		// Load the dataset into memory by updating the datasets map
		datasets.set(id, sections);
	} catch (error: any) {
		throw new InsightError(`Failed to load dataset '${id}' from disk: ${error.message}`);
	}
}

// Loads the metadata.json from disk into the metadata map in memory
export async function loadMetaDataFromDisk(metadata: Map<string, InsightDataset>): Promise<void> {
	try {
		// Ensure the datasets directory exists
		await fs.ensureDir(getDataDir());
		const metadataFilePath = getDiskMetadataPath();
		const fileExists = await fs.pathExists(metadataFilePath);
		if (!fileExists) {
			// console.log("No metadata file found on disk.");
			return; // Nothing to load
		}

		const parsedMetadata = await fs.readFile(metadataFilePath, "utf8");
		const metadataArray = JSON.parse(parsedMetadata);
		for (const dataset of metadataArray) {
			metadata.set(dataset.id, dataset);
		}
		// console.log("Metadata successfully loaded into memory.");

		// Check for inconsistencies and save the consolidated metadata to back to disk to avoid any possible inconsistency
		await checkMetadataConsistency(metadata);
		// await saveMetadataToDisk(metadata);
	} catch (error) {
		throw new InsightError(`Failed to load datasets from disk: ${error}`);
	}
}

// Function that checks if the loaded MetaData is consistent with the datasets stored on Disk
export async function checkMetadataConsistency(metadata: Map<string, InsightDataset>): Promise<void> {
	// Create a Set for quick lookup of dataset IDs stored on disk
	const datasetFiles = await fs.readdir(getDataDir()); // get all filenames in the datasets directory

	const datasetIdsOnDisk = new Set<string>(
		datasetFiles
			.filter((file) => file !== "metadata.json") // Filter out the metadata.json file
			.map((file) => path.parse(file).name)
	);

	// Iterate through the metadata map and check for consistency
	for (const id of metadata.keys()) {
		if (!datasetIdsOnDisk.has(id)) {
			console.warn(`Dataset with ID '${id}' is not on disk but is in the metadata. Removing from metadata.`);
			// metadata.delete(id); // Remove from metadata if the corresponding dataset is not found on disk
		}
	}
	// Iterate through datasetIdsOnDisk and check for datasets that are not in the metadata
	for (const datasetId of datasetIdsOnDisk) {
		if (!metadata.has(datasetId)) {
			console.warn(`Dataset with ID '${datasetId}' exists on disk but is not in the metadata.`);
			// Optionally: Remove the dataset from disk if it shouldn't exist, or log an error for further action
		}
	}
}
