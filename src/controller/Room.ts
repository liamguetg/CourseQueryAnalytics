export class Room {
	// From the buildings HTML files (rooms table)
	public number: string; // Room number
	public seats: number; // Room capacity
	public furniture: string; // Room furniture
	public type: string; // Room type
	public href: string; // Room link

	// From the index.htm file (building Table)
	public fullname: string; // Full building name
	public shortname: string; // Building code (short name)
	public address: string; // Building address
	public name: string; // Combination of fullname and room number
	public lon: number; // Longitude (currently ignored)
	public lat: number; // Latitude (currently ignored)

	constructor(
		number: string,
		seats: number,
		furniture: string,
		type: string,
		href: string,
		fullname: string,
		shortname: string,
		address: string,
		lon: number,
		lat: number
	) {
		this.number = number;
		this.seats = seats;
		this.furniture = furniture;
		this.type = type;
		this.href = href;
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.name = `${shortname}_${number}`;
		this.lon = lon;
		this.lat = lat;
	}
}

// field in rooms class (data type) : found in HTML file after:
// In the rooms table:
// number (string): <td class="views-field views-field-field-room-number number">
// seats (number) : <td class="views-field views-field-field-room-capacity">
// furniture (string): <td class="views-field views-field-field-room-furniture">
// type (string): <td class="views-field views-field-field-room-type">
// href (string): <td class="views-field views-field-nothing">
//
//
// In the buildings table (ie the index.htm file):
// fullname (string) : <td class="views-field views-field-title">
// shortname (string) : <td class="views-field views-field-field-building-code">
// address (string) : <td class="views-field views-field-field-building-address">
// name (string) : fullname + "_" + number
// lon (number) : ignore for now
// lat (number) : ignore for now

// a little confused about href as it's actually stored as:
// <td class="views-field views-field-nothing">
// <a href="http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A101">More info</a>     </td>
