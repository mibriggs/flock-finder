import { readCsvFile } from '$lib';
import { loadCsv, clearCsv } from '$lib/csvStore';
import type { EBirdEntry } from '$lib/eBirdEntry';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, data }) => {
	console.time('[timing] fetch demo.csv');
	const response = await fetch('/demo.csv');
	console.timeEnd('[timing] fetch demo.csv');

	console.time('[timing] loadCsv (IndexedDB read)');
	const csv = await loadCsv();
	console.timeEnd('[timing] loadCsv (IndexedDB read)');

	let birds: EBirdEntry[] | null = null;
	let csvData = await response.text();

	if (csv !== undefined) {
		csvData = csv;
	}

	console.time('[timing] readCsvFile total');
	const { object: birdData, error } = readCsvFile(csvData);
	console.timeEnd('[timing] readCsvFile total');
	if (!error) {
		birds = birdData;
	} else {
		console.error(error);
	}

	if (birds === null) {
		await clearCsv();
		throw redirect(303, '/?uploadError=true');
	}
	return { ...data, birds };
};
