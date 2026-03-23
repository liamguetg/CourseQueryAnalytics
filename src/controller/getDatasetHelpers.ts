import { Section } from "./Section";
import { Room } from "./Room";
import { InsightDataset, InsightDatasetKind, InsightError } from "./IInsightFacade";

export function getDataset(
	id: string,
	metadata: Map<string, InsightDataset>,
	sectionsDatasets: Map<string, Section[]>,
	roomsDatasets: Map<string, Room[]>
): Section[] | Room[] {
	if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
		return sectionsDatasets.get(id)!;
	}
	if (metadata.get(id)?.kind === InsightDatasetKind.Rooms) {
		return roomsDatasets.get(id)!;
	}
	throw new InsightError(`Either the kind is invalid or the dataset with id ${id} was not found`);
}

export function enforceFieldTypes(
	id: string,
	dataset: Section[] | Room[],
	metadata: Map<string, InsightDataset>
): void {
	if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
		enforceSectionsFieldTypes(dataset as Section[]);
	}
	if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
		enforceRoomsFieldTypes(dataset as Room[]);
	}
}

function enforceSectionsFieldTypes(dataset: Section[]): void {
	dataset.forEach((section) => {
		section.uuid = typeof section.uuid === "string" ? section.uuid : String(section.uuid);
		section.instructor = typeof section.instructor === "string" ? section.instructor : String(section.instructor);
		section.title = typeof section.title === "string" ? section.title : String(section.title);
		section.dept = typeof section.dept === "string" ? section.dept : String(section.dept);
		section.id = typeof section.id === "string" ? section.id : String(section.id);
		section.avg = typeof section.avg === "number" ? section.avg : Number(section.avg);
		section.pass = typeof section.pass === "number" ? section.pass : Number(section.pass);
		section.fail = typeof section.fail === "number" ? section.fail : Number(section.fail);
		section.audit = typeof section.audit === "number" ? section.audit : Number(section.audit);
		section.year = typeof section.year === "number" ? section.year : Number(section.year);
	});
}

function enforceRoomsFieldTypes(dataset: Room[]): void {
	dataset.forEach((room) => {
		room.number = typeof room.number === "string" ? room.number : String(room.number);
		room.seats = typeof room.seats === "number" ? room.seats : Number(room.seats);
		room.furniture = typeof room.furniture === "string" ? room.furniture : String(room.furniture);
		room.type = typeof room.type === "string" ? room.type : String(room.type);
		room.href = typeof room.href === "string" ? room.href : String(room.href);
		room.fullname = typeof room.fullname === "string" ? room.fullname : String(room.fullname);
		room.shortname = typeof room.shortname === "string" ? room.shortname : String(room.shortname);
		room.address = typeof room.address === "string" ? room.address : String(room.address);
		room.lon = typeof room.lon === "number" ? room.lon : Number(room.lon);
		room.lat = typeof room.lat === "number" ? room.lat : Number(room.lat);
	});
}
