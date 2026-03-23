import path from "path";
import { InsightDataset, InsightDatasetKind, InsightError } from "./IInsightFacade";
import JSZip from "jszip";

// Returns file path for data directory (where databases are stored)
export function getDataDir(): string {
	return path.join(__dirname, "../../data");
}

// Returns file path for metadata file saved on Disk
export function getDiskMetadataPath(): string {
	return path.join(getDataDir(), "metadata.json");
}

// Checks if dataset ID is valid
// Throws InsightError if not valid
export function isValidId(id: string): void {
	// Reject if the id contains an underscore or is only whitespace characters

	if (!(id.trim() === "" || id.includes("_"))) {
		return;
	} else {
		throw new InsightError("Invalid dataset ID.");
	}
}

// Checks if dataset kind is valid/correct type
// Throws InsightError if not valid
export function isCorrectKind(kind: InsightDatasetKind): void {
	if (!(kind === InsightDatasetKind.Sections || kind === InsightDatasetKind.Rooms)) {
		throw new InsightError(`Unsupported dataset kind: ${kind}`);
	}
}

// Checks if a string is a valid base64 string
// Throws InsightError if not valid
export function isBase64(string: string): void {
	const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	const base64Num = 4;
	// Check if the string length is a multiple of 4
	if (string.length % base64Num !== 0) {
		throw new InsightError("File not base64");
	}
	// Check if each character is valid Base64 character
	for (const char of string) {
		if (!base64Chars.includes(char)) {
			throw new InsightError("File not base64");
		}
	}
	return;
}

// True if dataset has already been added, else false
export function isAlreadyAdded(metadata: Map<string, InsightDataset>, id: string): boolean {
	return metadata.has(id);
}

// Checks if dataset has a folder called courses
// Throws InsightError if courses folder is missing
export function hasCoursesFolder(zip: JSZip): JSZip {
	// A really awkward way of (double) checking if there is a folder called courses
	const folders = Object.keys(zip.files).filter((filename) => zip.files[filename].dir);
	const coursesFolderName = folders.find((folder) => folder === "courses/");
	const courseFolder = zip.folder("courses");


	if (!coursesFolderName || !courseFolder) {
		
		throw new InsightError("Missing 'courses/' folder in dataset");
	} else {
		return courseFolder;
	}
}

export function isZipFile(content: string): void {
	// Decode base64 content
	const decodedContent = Buffer.from(content, "base64");
	// Minimum ZIP file size in bytes (just an approximate small size)
	const minimumZipSize = 4;

	// Check for minimum file size to contain a valid ZIP structure
	if (decodedContent.length < minimumZipSize) {
		// console.log("Not a zip - short")
		throw new InsightError("Provided file is not a valid ZIP file (too small).");
	}
	const zipIndicator1 = 0x50; // P
	const zipIndicator2 = 0x4b; // K
	const zipIndicator3 = 0x03; // 3
	const zipIndicator4 = 0x04; // 4

	const two = 2;
	const three = 3;

	// Check for ZIP signature (0x50 0x4B 0x03 0x04)
	const isZip =
		decodedContent[0] === zipIndicator1 &&
		decodedContent[1] === zipIndicator2 &&
		decodedContent[two] === zipIndicator3 &&
		decodedContent[three] === zipIndicator4;

	if (!isZip) {

		throw new InsightError("Provided file is not a valid ZIP file.");
	}

}
