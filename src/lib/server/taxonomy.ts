import * as v from 'valibot';
import Papa from 'papaparse';
import raw from '../../../data/taxonomy.csv?raw';

const TaxonomyRowSchema = v.object({
	TAXON_ORDER: v.pipe(v.string(), v.transform(Number)),
	CATEGORY: v.string(),
	SPECIES_CODE: v.string(),
	TAXON_CONCEPT_ID: v.string(),
	PRIMARY_COM_NAME: v.string(),
	SCI_NAME: v.string(),
	ORDER: v.string(),
	FAMILY: v.string(),
	SPECIES_GROUP: v.string(),
	REPORT_AS: v.string()
});

const { data } = Papa.parse(raw, { header: true, skipEmptyLines: true });
const rows = data.flatMap((row) => {
	const result = v.safeParse(TaxonomyRowSchema, row);
	if (!result.success) {
		console.warn('Invalid row:', row, result.issues);
		return [];
	}
	return [result.output];
});

export const taxonomyMap: Map<string, string> = new Map(
	rows.map((row) => [row.SCI_NAME.trim().toLowerCase(), row.SPECIES_CODE])
);
