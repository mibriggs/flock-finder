import {
	array,
	date,
	number,
	object,
	optional,
	pipe,
	string,
	transform,
	unknown,
	type InferOutput
} from 'valibot';

export const birdSchema = object({
	submissionId: string(),
	commonName: string(),
	scientificName: string(),
	taxonomicOrder: number(),
	count: pipe(
		unknown(),
		transform((count) => {
			if (typeof count === 'string') {
				return undefined;
			}
			return count as number;
		}),
		optional(number())
	), // undefined here means that there was an unspecified number of birds seen (at least one but cannot be sure)
	stateOrProvince: string(),
	county: optional(string()),
	locationId: string(),
	location: string(),
	latitude: number(),
	longitude: number(),
	date: pipe(
		string(),
		transform((dateString) => new Date(dateString)),
		date()
	),
	time: optional(string()),
	protocol: string(),
	durationInMinutes: optional(number()),
	allObsReported: number(),
	distanceTraveledInKm: optional(number()),
	areaCovered: optional(number()),
	numObservers: optional(number()),
	breedingCode: optional(string()),
	observationDetails: optional(string()),
	checklistComments: optional(string()),
	mlCatalogNumbers: pipe(
		unknown(),
		transform((catalogNumbers) => {
			let newArray: number[] = [];
			if (typeof catalogNumbers === 'string') {
				newArray = catalogNumbers.split(' ').map((asString) => parseInt(asString));
			}
			if (typeof catalogNumbers === 'number') newArray = [catalogNumbers as number];
			return newArray;
		}),
		array(number())
	)
});

export type EBirdEntry = InferOutput<typeof birdSchema>;
