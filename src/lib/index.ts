import Papa from 'papaparse';
import { fileLoadTracker } from './fileLoadingEvent.svelte';
import { parse } from 'valibot';
import { birdSchema, type EBirdEntry } from './eBirdEntry';
import type { Map } from 'maplibre-gl';
import type { FeatureCollection, Feature, GeoJsonProperties, Point } from 'geojson';
import birdImage from '$lib/assets/birdNoBg.png';
import { Time, type DateValue } from '@internationalized/date';
import { browser } from '$app/environment';

export const MAP_PANEL_CONTEXT = Symbol('mapPanel');
export const SATELITE_MAP_CONTEXT = Symbol('sateliteMap');
const COOKIE_DEFAULTS = 'SameSite=Lax; Secure';
const TWENTY_FOUR_HOUR_TIME_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;
const TWELVE_HOUR_TIME_REGEX = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

export interface MapPanelContext {
	isMapPanelUpdating: boolean;
}
export interface SateliteMapContext {
	useSateliteMap: boolean;
}

type DropZoneEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

export function isInDateRange(date: Date, start: DateValue, end: DateValue): boolean {
	const sightedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const startDate = new Date(start.year, start.month - 1, start.day);
	const endDate = new Date(end.year, end.month - 1, end.day);
	return sightedDate >= startDate && sightedDate <= endDate;
}

export const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
};

export interface FileDropZoneProps {
	allowedExtensions: string[];
	class?: string;
	dropZoneContainer: HTMLElement | undefined;
	onFileSelection: (e: DropZoneEvent) => Promise<void>;
}

export interface ObjectOrError<T> {
	error?: Error;
	object: T;
}

export interface BirdFeatureProperties {
	title: string;
	scientificName: string;
	date: string;
	location: string;
	count?: number;
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
		fileReader.onloadend = () => fileLoadTracker.endLoading();

		fileReader.onerror = () =>
			reject(new Error(`Error reading file: ${fileReader.error?.message}`));

		fileReader.readAsText(file);
	});
}

function bytesToBinaryString(bytes: Uint8Array): string {
	let binary = '';
	const chunkSize = 0x8000; // avoid exceeding the call-stack argument limit on spread
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return binary;
}

function binaryStringToBytes(binary: string): Uint8Array<ArrayBuffer> {
	const bytes: Uint8Array<ArrayBuffer>= new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export async function compressText(text: string): Promise<string> {
	const bytes = new TextEncoder().encode(text);
	const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
	const compressedBuffer = await new Response(stream).arrayBuffer();
	return bytesToBinaryString(new Uint8Array(compressedBuffer));
}

export async function decompressText(binary: string): Promise<string> {
	const bytes = binaryStringToBytes(binary);
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
	const decompressedBuffer = await new Response(stream).arrayBuffer();
	return new TextDecoder().decode(decompressedBuffer);
}

export function readCsvFile(csvData: string): ObjectOrError<EBirdEntry[]> {
	let actualUnsolvedErrors = 0;
	const parsed = Papa.parse<Record<string, unknown>>(csvData, {
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
		return {
			object: [],
			error: new Error(`CSV Parsing Errors:\n${parsed.errors.map((e) => e.message).join('\n')}`)
		};
	}

	const papaparseResult = parsed.data;
	if (papaparseResult.length === 0) {
		return { object: [] };
	}
	try {
		const typedOutput: EBirdEntry[] = papaparseResult.map((row) => parse(birdSchema, row));
		return { object: typedOutput };
	} catch (error: unknown) {
		console.error(error);
		return { object: [], error: new Error('An error occurred when parsing the csv.') };
	}
}

export async function addMarkersToMap(birds: EBirdEntry[], map: Map) {
	const birdMarkers: Feature<Point, GeoJsonProperties>[] = birds.map((bird) => {
		return {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [
					bird.longitude + (Math.random() - 0.5) * 0.0005,
					bird.latitude + (Math.random() - 0.5) * 0.0005
				]
			},
			properties: {
				title: bird.commonName,
				date: formatDate(bird.date),
				scientificName: bird.scientificName,
				count: bird.count,
				location: bird.location
			}
		};
	});

	const geoJson: FeatureCollection<Point, GeoJsonProperties> = {
		type: 'FeatureCollection',
		features: birdMarkers
	};

	map.addSource('markers', {
		type: 'geojson',
		data: geoJson,
		cluster: true,
		clusterMaxZoom: 8,
		clusterRadius: 20
	});

	map.addLayer({
		id: 'cluster-halo',
		type: 'circle',
		source: 'markers',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': [
				'step',
				['get', 'point_count'],
				'#2563eb',
				50,
				'#eab308',
				200,
				'#ea580c',
				1000,
				'#b91c1c'
			],
			'circle-radius': ['step', ['get', 'point_count'], 30, 50, 40, 200, 52, 1000, 68],
			'circle-opacity': 0.2
		}
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'markers',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': [
				'step',
				['get', 'point_count'],
				'#2563eb',
				50,
				'#eab308',
				200,
				'#ea580c',
				1000,
				'#b91c1c'
			],
			'circle-radius': ['step', ['get', 'point_count'], 16, 50, 22, 200, 30, 1000, 40]
		}
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'markers',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-size': 12,
			'text-font': ['Noto Sans Bold']
		},
		paint: { 'text-color': '#ffffff' }
	});

	const loadedBirdImage = await map.loadImage(birdImage);
	map.addImage('birdIcon', loadedBirdImage.data);
	map.addLayer({
		id: 'marker-layer',
		type: 'symbol',
		source: 'markers',
		filter: ['!', ['has', 'point_count']],
		layout: {
			'icon-image': 'birdIcon',
			'icon-size': 0.055,
			'icon-allow-overlap': true
		}
	});
}

export function setCookie(
	name: string,
	value: string,
	path: string = '/',
	expiresInMs: number = 400 * 24 * 60 * 60 * 1000
) {
	if (!browser) {
		throw new Error(
			'setCookie() can only be used in the browser, make sure to check for browser object first'
		);
	}

	const expiresDate = new Date(Date.now() + expiresInMs);
	const maxAgeSeconds = Math.floor(expiresInMs / 1000);

	const cookieParts: string[] = [
		`${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
		`path=${path}`,
		`expires=${expiresDate.toUTCString()}`,
		`max-age=${maxAgeSeconds}`,
		COOKIE_DEFAULTS
	];
	document.cookie = cookieParts.join('; ');
}

export function getCookie(name: string): string | undefined {
	if (!browser) {
		throw new Error(
			'getCookie() can only be used in the browser, make sure to check for browser object first'
		);
	}

	const cookies = document.cookie.split('; ');
	const encodedName = encodeURIComponent(name);

	for (const cookie of cookies) {
		const [cookieName, ...rest] = cookie.split('=');
		if (cookieName === encodedName) {
			return decodeURIComponent(rest.join('='));
		}
	}

	return undefined;
}

export function deleteCookie(name: string, path: string = '/') {
	if (!browser) {
		throw new Error(
			'deleteCookie() can only be used in the browser, make sure to check for browser object first'
		);
	}

	document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; ${COOKIE_DEFAULTS}`;
}

export const parseTime = (input: string): Time => {
	const trimmed = input.trim();
	if (TWENTY_FOUR_HOUR_TIME_REGEX.test(trimmed)) {
		return parseTwentyFourHourTime(trimmed);
	}
	if (TWELVE_HOUR_TIME_REGEX.test(trimmed)) {
		return parseTwelveHourTime(trimmed);
	}
	throw new Error(`Invalid time string: ${input}`);
};

const parseTwentyFourHourTime = (input: string): Time => {
	const [hourStr, minuteStr] = input.split(':');
	return new Time(parseInt(hourStr, 10), parseInt(minuteStr, 10));
};

const parseTwelveHourTime = (input: string): Time => {
	const match = input.match(TWELVE_HOUR_TIME_REGEX);
	if (!match) throw new Error(`Invalid time string: ${input}`);
	const [, hourStr, minuteStr, meridiem] = match;
	let hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr, 10);
	if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
	if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
	return new Time(hour, minute);
};
