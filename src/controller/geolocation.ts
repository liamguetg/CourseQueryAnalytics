// import https from "http";
// import { URL } from "url";

// interface GeoResponse {
// 	lat?: number;
// 	lon?: number;
// 	error?: string;
// }

// export async function fetchGeoLocationWithTimeout(
// 	address: string,
// 	timeout = 30000
// ): Promise<{ lat: number; lon: number } | null> {
// 	// Define a timeout promise that rejects after the specified time
// 	const timeoutPromise = new Promise<null>((_, reject) =>
// 		setTimeout(() => reject(new Error("Request timed out")), timeout)
// 	);

// 	try {
// 		const location = await Promise.race([fetchGeoLocation(address), timeoutPromise]);

// 		// Check if the location has valid lat and lon values
// 		if (location?.lat !== undefined && location.lon !== undefined) {
// 			return { lat: location.lat, lon: location.lon };
// 		}
// 		return null; // If lat/lon are missing, return null
// 	} catch (error) {
// 		console.error("Error in fetchGeoLocationWithTimeout:", error);
// 		return null;
// 	}
// }

// export async function fetchGeoLocation(address: string): Promise<GeoResponse> {
// 	const encodedAddress = encodeURIComponent(address);
// 	const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team206/${encodedAddress}`;

// 	return new Promise((resolve) => {
// 		https
// 			.get(new URL(url), (res) => {
// 				let data = "";

// 				// Collect the response data
// 				res.on("data", (chunk) => {
// 					data += chunk;
// 				});

// 				// On end of the response
// 				res.on("end", () => {
// 					try {
// 						const jsonData: GeoResponse = JSON.parse(data);
// 						if (jsonData.lat !== undefined && jsonData.lon !== undefined) {
// 							resolve({ lat: jsonData.lat, lon: jsonData.lon });
// 						} else {
// 							resolve({ error: "Latitude and longitude not available" });
// 						}
// 					} catch (error) {
// 						resolve({ error: `Geolocation fetch failed: ${error}` });
// 					}
// 				});
// 			})
// 			.on("error", (error) => {
// 				resolve({ error: `Request failed ${error}` });
// 			});
// 	});
// }