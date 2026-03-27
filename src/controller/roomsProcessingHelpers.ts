import * as parse5 from "parse5";
import { Room } from "./Room";
import { InsightError } from "./IInsightFacade";
import { Building } from "./Building";
import JSZip from "jszip";
import { fetchGeoLocationWithTimeout } from "./geolocation";

// HTML Parsing and data extraction made with the help of generative AI

// BUILDING / INDEX.HTM PROCESSING HELPERS

// Finds and returns the index.htm file as a parsable JSZipObject
// Throws InsightError if index.htm is not found in the root of the Zip file
export function hasIndexFile(loadedZip: JSZip): JSZip.JSZipObject {
    const indexFile = loadedZip.file("index.htm");
    if (indexFile) {
        return indexFile;
    }
    throw new InsightError("Missing index.htm file in rooms dataset.");
}

// Function to extract building information from the index.htm file
export function extractBuildingInfo(document: any): Building[] {
    //Find Building Table in the index.htm file
    const buildingTable = findBuildingTable(document);

    // Process each row of the building table into a Building object
    const rows = buildingTable.childNodes.find((node: any) => node.nodeName === "tbody").childNodes;
    const buildings = processBuildingTableRows(rows);
    return buildings;
}

// Function to get each building's (rows) information from the buildingTable
function processBuildingTableRows(rows: any[]): Building[] {
    const buildings: Building[] = [];

    for (const row of rows) {
        if (!row.childNodes) {
            continue; // Skip rows without child nodes
        }

        const cells = row.childNodes.filter((node: any) => node.nodeName === "td");
        let shortname = undefined,
            fullname = undefined,
            address = undefined,
            href = undefined;

        for (const cell of cells) {
            const classAttr = cell.attrs ? cell.attrs.find((attr: any) => attr.name === "class") : null;
            if (classAttr) {
                if (classAttr.value.includes("views-field-title")) {
                    fullname = extractTitleFromCell(cell, "views-field-title") || "";
                    href = extractLinkFromCell(cell, "views-field-title") || "";
                }
                if (classAttr.value.includes("views-field-field-building-code")) {
                    shortname = cell.childNodes[0].value ? cell.childNodes[0].value.trim() : "";
                }
                if (classAttr.value.includes("views-field-field-building-address")) {
                    address = cell.childNodes[0].value ? cell.childNodes[0].value.trim() : "";
                }
            }
        }

        if (validateBuildingInfo(shortname, address, fullname, href)) {
            const newBuilding = new Building(fullname!, shortname, address, href!);
            buildings.push(newBuilding);
        }
    }
    return buildings;
}

function validateBuildingInfo(
    shortname: string | undefined,
    address: string | undefined,
    fullname: string | undefined | null,
    href: string | undefined | null
): boolean {
    if (
        typeof shortname === "string" &&
        typeof address === "string" &&
        typeof fullname === "string" &&
        typeof href === "string"
    ) {
        return true;
    }
    return false;
}

// Main function to find the correct building table
export function findBuildingTable(document: any): any {
    // Get all tables from the document
    const tables = findElementsByTagName(document, "table");

    for (const table of tables) {
        // Search through each table row <tr> to see if it contains the expected <td> elements
        const rows = findElementsByTagName(table, "tr");
        for (const row of rows) {
            const buildingImageCell = findElementByClass(row, "td", "views-field-field-building-image");
            const buildingCodeCell = findElementByClass(row, "td", "views-field-field-building-code");
            const buildingTitleCell = extractTitleFromRow(row, "views-field-title");
            const buildingLinkCell = extractLinkFromRow(row, "views-field-title");
            const buildingAddressCell = findElementByClass(row, "td", "views-field-field-building-address");
            // console.log(buildingTitleCell);

            // If all required cells are found, assume this is the correct table
            if (buildingImageCell && buildingCodeCell && buildingAddressCell && buildingTitleCell && buildingLinkCell) {
                return table; // This is the correct building table
            }
        }
    }
    throw new InsightError("No valid building table found");
}

// ROOMS PROCESSING HELPERS

export async function processRooms(buildingEntries: Building[], loadedZip: JSZip): Promise<Room[]> {
    const processedRooms: Room[] = [];

    const roomPromises = buildingEntries.map(async (building) => {
        const normalizedHref = building.href.replace(/^\.\/|^\//, ""); // Remove leading "./" if present
        const roomsFile = loadedZip.file(normalizedHref);

        if (roomsFile) {
            const roomsData = await roomsFile.async("text");
            const rooms = await parseRoomsFile(roomsData, building);
            if (rooms) {
                processedRooms.push(...rooms);
            }
        }
    });
    await Promise.all(roomPromises);
    return processedRooms;
}

export async function parseRoomsFile(htmlRoomsData: string, building: Building): Promise<Room[] | null> {
    const document = parse5.parse(htmlRoomsData);
    const roomsTable = findRoomsTable(document);

    if (roomsTable) {
        const rows = roomsTable.childNodes.find((child: any) => child.tagName === "tbody")?.childNodes;
        const rooms = await processRoomTableRows(rows, building);
        return rooms;
    }
    // No Valid roomTable found
    return null;
}

function findRoomsTable(document: any): any {
    // Get all tables from the document
    const tables = findElementsByTagName(document, "table");

    for (const table of tables) {
        // Search through each table row <tr> to see if it contains the expected <td> elements
        const rows = findElementsByTagName(table, "tr");

        for (const row of rows) {

            const roomsCapacityCell = findElementByClass(row, "td", "views-field-field-room-capacity");
            const roomsFurnitureCell = findElementByClass(row, "td", "views-field-field-room-furniture");
            const roomsTypeCell = findElementByClass(row, "td", "views-field-field-room-type");
            // const roomsHrefCell = findElementByClass(row, "td", "views-field views-field-nothing");


            // If all required cells are found, assume this is the correct table
            if (roomsCapacityCell && roomsFurnitureCell && roomsTypeCell) {

                return table; // This is the correct building table
            }
        }
    }
}

async function processRoomTableRows(rows: any[], building: Building): Promise<Room[]> {
    const roomPromises: Promise<Room | null>[] = []; // Use T[] instead of Array<T>

    for (const row of rows) {
        if (!row.childNodes) {
            continue; // Skip rows without child nodes
        }

        const roomInfo = processRoomTableCells(row);
        // console.log(roomInfo);

        if (roomInfo) {
            const roomPromise: Promise<Room | null> = fetchGeoLocationWithTimeout(building.address)
                .then((location) => {
                    const lat = location?.lat ?? 0; // Default to 0 if undefined
                    const lon = location?.lon ?? 0; // Default to 0 if undefined

                    // Check if both lat and lon are 0, indicating an invalid location
                    if (lat === 0 && lon === 0) {
                        return null; // Return null for invalid geolocation
                    }

                    return createRoom(roomInfo, building, lat, lon); // Create a valid Room
                })
                .catch((error: any) => {
                    // Handle geolocation retrieval error gracefully
                    console.log(`Error retrieving geolocation: ${error}`);
                    return null; // Return null if an error occurs
                });

            roomPromises.push(roomPromise); // Add the promise to the array
        }
    }

    // Return all valid Room objects; filter out any null values
    return Promise.all(roomPromises).then((rooms) => rooms.filter((room): room is Room => room !== null)); // Type guard to filter out nulls
}

function processRoomTableCells(
    row: any
): { href: string; number: string; seats: number; furniture: string; type: string } | null {
    const rowCells = row.childNodes.filter((node: any) => node.nodeName === "td");

    let seats = undefined,
        furniture = undefined,
        type = undefined,
        href = undefined,
        number = undefined;

    for (const cell of rowCells) {
        const className = cell.attrs.find((attr: any) => attr.name === "class")?.value;
        if (className.includes("views-field-field-room-number")) {
            number = extractTitleFromRow(row, "views-field-field-room-number") || "";
            href = extractLinkFromCell(cell, "views-field-field-room-number") || "";
        } else if (className.includes("views-field-field-room-capacity")) {
            seats = Number(cell.childNodes[0]?.value.trim()) || 0;
        } else if (className.includes("views-field-field-room-furniture")) {
            furniture = cell.childNodes[0]?.value ? cell.childNodes[0]?.value.trim() : "";
        } else if (className.includes("views-field-field-room-type")) {
            type = cell.childNodes[0]?.value ? cell.childNodes[0].value.trim() : "";
        }
    }
    if (validateRoomKeys(type, furniture, seats, href, number)) {
        return {
            href: href!,
            seats: seats!,
            furniture: furniture!,
            type: type!,
            number: number!,
        };
    }
    return null;
}

// Create and return a new Room object
function createRoom(roomInfo: any, building: Building, lat: number, lon: number): Room | null {
    if (roomInfo) {
        return new Room(
            roomInfo.number,
            roomInfo.seats,
            roomInfo.furniture,
            roomInfo.type,
            roomInfo.href,
            building.fullname,
            building.shortname,
            building.address,
            lon,
            lat
        );
    }
    return null;
}

function validateRoomKeys(
    type: string | undefined,
    furniture: string | undefined,
    seats: number | undefined,
    href: string | undefined | null,
    number: string | undefined | null
): boolean {
    if (
        typeof type === "string" &&
        typeof furniture === "string" &&
        typeof seats === "number" &&
        typeof href === "string" &&
        typeof number === "string"
    ) {
        return true;
    }

    return false;
}

function findElementByClass(element: any, tag: string, className: string): any {
    if (element.tagName && element.tagName === tag && hasClass(element, className)) {
        return element;
    }
    if (element.childNodes && element.childNodes.length > 0) {
        for (const child of element.childNodes) {
            const result = findElementByClass(child, tag, className);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

function findElementsByTagName(element: any, tagName: string): any[] {
    let elements: any[] = [];
    if (element.tagName && element.tagName === tagName) {
        elements.push(element);
    }
    if (element.childNodes && element.childNodes.length > 0) {
        for (const child of element.childNodes) {
            elements = elements.concat(findElementsByTagName(child, tagName));
        }
    }
    return elements;
}

function hasClass(element: any, className: string): boolean {
    const classAttr = element.attrs?.find((attr: any) => attr.name === "class");
    if (classAttr) {
        const classes = classAttr.value.split(" ");

    }
    return false;
}

// Helper function to find the building link (href) from a row in the building table
function extractLinkFromRow(row: any, className: string): string | null {
    for (const cell of row.childNodes) {
        const link = extractLinkFromCell(cell, className);
        if (link) {
            return link;
        }
    }
    return null;
}

// Helper function to find the building title (room number) from a row in the building table
function extractTitleFromRow(row: any, className: string): string | null {
    for (const cell of row.childNodes) {
        const title = extractTitleFromCell(cell, className);
        if (title) {
            return title;
        }
    }
    return null;
}

// Helper function to find the building link (href) from a given cell
function extractLinkFromCell(node: any, className: string): string | null {
    if (node.nodeName === "td" && node.attrs) {
        const classAttr = node.attrs.find((attr: any) => attr.name === "class");
        if (classAttr?.value.includes(className)) {
            const anchorTag = node.childNodes.find((child: any) => child.nodeName === "a");
            if (anchorTag) {
                const hrefAttr = anchorTag.attrs.find((attr: any) => attr.name === "href");
                return hrefAttr ? hrefAttr.value : null;
            }
        }
    }
    return null;
}

// Helper function to find the building title (room number) from a given cell
function extractTitleFromCell(node: any, className: string): string | null {
    if (node.nodeName === "td" && node.attrs) {
        const classAttr = node.attrs.find((attr: any) => attr.name === "class");

        if (classAttr?.value.includes(className)) {
            const anchorTag = node.childNodes.find((child: any) => child.nodeName === "a");
            return anchorTag?.childNodes[0]?.value?.trim() || null;
        }
    }
    return null;
}