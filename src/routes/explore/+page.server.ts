import { taxonomyMap } from '$lib/server/taxonomy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { taxonomyMap };
};
