import { readCsvFile } from '$lib';
import { loadCsv, clearCsv } from '$lib/csvStore';
import type { EBirdEntry } from '$lib/eBirdEntry';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ fetch, data }) => {
	const birdsPromise = (async (): Promise<EBirdEntry[]> => {
		const response = await fetch('/demo.csv');
		const csv = await loadCsv();

		let csvData = await response.text();
		if (csv !== undefined) {
			csvData = csv;
		}

		const { object: birdData, error } = readCsvFile(csvData);

		if (error) {
			console.error(error);
			await clearCsv();
			throw error;
		}

		return birdData;
	})();

	return { ...data, birds: birdsPromise };
};
