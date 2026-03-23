export class Building {
	public fullname: string; // Full building name
	public shortname: string; // Building code (short name)
	public address: string; // Building address
	public href: string; // Room link

	constructor(fullname: string, shortname: string, address: string, href: string) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.href = href;
	}
}
