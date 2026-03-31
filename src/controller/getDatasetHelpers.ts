import { Section } from "./Section";
import { InsightDataset, InsightDatasetKind, InsightError } from "./IInsightFacade";

export function getDataset(
	id: string,
	metadata: Map<string, InsightDataset>,
	sectionsDatasets: Map<string, Section[]>
	// roomsDatasets: Map<string, Room[]>
): Section[] {
	if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
		return sectionsDatasets.get(id)!;
	}
	throw new InsightError(`Either the kind is invalid or the dataset with id ${id} was not found`);
}

// export function enforceFieldTypes(
// 	id: string,
// 	dataset: Section[],
// 	metadata: Map<string, InsightDataset>
// ): void {
// 	if (metadata.get(id)?.kind === InsightDatasetKind.Sections) {
// 		enforceSectionsFieldTypes(dataset as Section[]);
// 	}
// }

// function enforceSectionsFieldTypes(dataset: Section[]): void {
// 	dataset.forEach((section) => {
// 		section.uuid = typeof section.uuid === "string" ? section.uuid : String(section.uuid);
// 		section.instructor = typeof section.instructor === "string" ? section.instructor : String(section.instructor);
// 		section.title = typeof section.title === "string" ? section.title : String(section.title);
// 		section.dept = typeof section.dept === "string" ? section.dept : String(section.dept);
// 		section.id = typeof section.id === "string" ? section.id : String(section.id);
// 		section.avg = typeof section.avg === "number" ? section.avg : Number(section.avg);
// 		section.pass = typeof section.pass === "number" ? section.pass : Number(section.pass);
// 		section.fail = typeof section.fail === "number" ? section.fail : Number(section.fail);
// 		section.audit = typeof section.audit === "number" ? section.audit : Number(section.audit);
// 		section.year = typeof section.year === "number" ? section.year : Number(section.year);
// 	});
// }
