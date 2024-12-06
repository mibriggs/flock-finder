import Papa from 'papaparse';
import { fileLoadTracker } from './fileLoadingEvent.svelte';
import { safeParse } from 'valibot';
import { birdSchema, type EBirdEntry } from './eBirdEntry';
import type { Map } from 'maplibre-gl';
import type { FeatureCollection, Feature, GeoJsonProperties, Point } from "geojson";
import birdImage from '$lib/assets/birdNoBg.png';


type DropZoneEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

export interface FileDropZoneProps {
	allowedExtensions: string[];
	class?: string;
	dropZoneContainer: HTMLElement | undefined;
	onFileSelection: (e: DropZoneEvent) => Promise<void>;
}

export function readFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.onload = () => {
			const result: string | ArrayBuffer | null = fileReader.result;
			if (result === null) {
				reject(new Error('FileReader result is null'));
			}
			// TODO i think we need to do some more robust checking to make sure the data is of the form I'm expecting. Aka that the ebird headers are present
			resolve(result as string);
		};

		fileReader.onloadstart = () => fileLoadTracker.startLoading();
		fileReader.onloadend = () => (fileLoadTracker.isProcessing = false);

		fileReader.onerror = () =>
			reject(new Error(`Error reading file: ${fileReader.error?.message}`));

		fileReader.readAsText(file);
	});
}

export function readCsvFile(csvData: string): EBirdEntry[] {
	let actualUnsolvedErrors = 0;
	const parsed = Papa.parse<Record<string, any>>(csvData, {
		header: true,
		dynamicTyping: true,
		skipEmptyLines: true,
		transformHeader: (header) => {
			const headerMap: Record<string, string> = {
				'Submission ID': 'submissionId',
				'Common Name': 'commonName',
				Count: 'count',
				'State/Province': 'stateOrProvince',
				'Location ID': 'locationId',
				Location: 'location',
				Latitude: 'latitude',
				Longitude: 'longitude',
				'All Obs Reported': 'allObsReported',
				'Area Covered (ha)': 'areaCovered',
				'Breeding Code': 'breedingCode',
				'Checklist Comments': 'checklistComments',
				County: 'county',
				Date: 'date',
				'Distance Traveled (km)': 'distanceTraveledInKm',
				'Duration (Min)': 'durationInMinutes',
				'ML Catalog Numbers': 'mlCatalogNumbers',
				'Number of Observers': 'numObservers',
				'Observation Details': 'observationDetails',
				Protocol: 'protocol',
				'Scientific Name': 'scientificName',
				'Taxonomic Order': 'taxonomicOrder',
				Time: 'time'
			};
			return headerMap[header] || header;
		},
		complete: (results) => {
			const keys = results.meta.fields || [];
			const newData = results.data.map((row) => {
				keys.forEach((key) => {
					if (!Object.keys(row).includes(key)) {
						row[key] = undefined;
					} else if (row[key] === null) {
						row[key] = undefined;
					}
				});
				return row;
			});

			const unsolvedErrors = results.errors.filter((error) => {
				const rowIndex = error.row ? error.row : 0;
				const isSolved =
					error.code === 'TooFewFields' &&
					Object.keys(newData[rowIndex]).every((objKey) => keys.includes(objKey));
				return !isSolved;
			});
			actualUnsolvedErrors = unsolvedErrors.length;
		}
	});

	if (actualUnsolvedErrors > 0) {
		throw new Error(`CSV Parsing Errors:\n${parsed.errors.map((e) => e.message).join('\n')}`);
	}

	const papaparseResult = parsed.data;
	const typedOutput = papaparseResult.map((row, indx) => {
		const valibotParseResult = safeParse(birdSchema, row);
		if (valibotParseResult.success) {
			return valibotParseResult.output;
		} else {
			const issues = valibotParseResult.issues;
			issues.forEach((issue) => console.warn(issue.input, issue.message, issue.path));
			throw new Error(`Validation error at row ${indx + 1}: ${valibotParseResult.issues}`);
		}
	});
	return typedOutput;
}

export async function addMarkersToMap(birds: EBirdEntry[], map: Map) {
	const birdMarkers: Feature<Point, GeoJsonProperties>[] = birds.map((bird) => {
		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [bird.longitude, bird.latitude]
			},
			properties: {
				title: bird.commonName,
				date: bird.date.toDateString()
			}
		}
	});

	const geoJson: FeatureCollection<Point, GeoJsonProperties> = {
		type: "FeatureCollection",
		features: birdMarkers
	};

	map.addSource("markers", {
		type: "geojson",
		data: geoJson
	});

	const loadedBirdImage = await map.loadImage(birdImage);
	map.addImage('birdIcon', loadedBirdImage.data);
	map.addLayer({
		id: "marker-layer",
		type: "symbol",
		source: "markers",
		layout: {
			"icon-image": "birdIcon",
			"icon-size": 0.04
		},
	});
}
