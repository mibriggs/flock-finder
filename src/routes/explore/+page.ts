import { readCsvFile } from '$lib';
import type { EBirdEntry } from '$lib/eBirdEntry';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, data }) => {
	const response = await fetch('/demo.csv');
	const csv = sessionStorage.getItem('csv');
	let birds: EBirdEntry[] | null = null;
	let csvData = await response.text();

	if (csv !== null) {
		csvData = csv;
	}

	const { object: birdData, error } = readCsvFile(csvData);
	if (!error) {
		birds = birdData;
	} else {
		console.error(error);
	}

	if (birds === null) {
		sessionStorage.clear();
		throw redirect(303, '/?uploadError=true');
	}
	return { ...data, birds };
};
