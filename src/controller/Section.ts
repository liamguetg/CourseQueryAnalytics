export class Section {
	public uuid: string; // JSON key: id
	public instructor: string; // JSON key: Professor
	public title: string; // JSON key: Title
	public dept: string; // JSON key: Subject
	public id: string; // JSON key: Course
	public avg: number; // JSON key: Avg
	public pass: number; // JSON key: Pass
	public fail: number; // JSON key: Fail
	public audit: number; // JSON key: Audit
	public year: number; // JSON key: Year

	constructor(
		uuid: string,
		instructor: string,
		title: string,
		dept: string,
		id: string,
		avg: number,
		pass: number,
		fail: number,
		audit: number,
		year: number
	) {
		this.uuid = uuid;
		this.instructor = instructor;
		this.title = title;
		this.dept = dept;
		this.id = id;
		this.avg = avg;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
		this.year = year;
	}
}
