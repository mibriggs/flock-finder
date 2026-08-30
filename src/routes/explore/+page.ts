import { readCsvFile } from '$lib';
import { loadCsv, clearCsv } from '$lib/csvStore';
import type { EBirdEntry } from '$lib/eBirdEntry';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ fetch, data }) => {
	const birdsPromise = (async (): Promise<EBirdEntry[]> => {
		console.time('[timing] fetch demo.csv');
		const response = await fetch('/demo.csv');
		console.timeEnd('[timing] fetch demo.csv');

		console.time('[timing] loadCsv (IndexedDB read)');
		const csv = await loadCsv();
		console.timeEnd('[timing] loadCsv (IndexedDB read)');

		let csvData = await response.text();
		if (csv !== undefined) {
			csvData = csv;
		}

		console.time('[timing] readCsvFile total');
		const { object: birdData, error } = readCsvFile(csvData);
		console.timeEnd('[timing] readCsvFile total');

		if (error) {
			console.error(error);
			await clearCsv();
			throw error;
		}

		return birdData;
	})();

	return { ...data, birds: birdsPromise };
};
