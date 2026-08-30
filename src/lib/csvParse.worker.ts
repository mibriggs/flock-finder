import { readCsvFile } from './index';
import type { EBirdEntry } from './eBirdEntry';

export interface CsvParseWorkerResult {
	ok: boolean;
	object?: EBirdEntry[];
	message?: string;
}

self.onmessage = (event: MessageEvent<string>) => {
	const { object, error } = readCsvFile(event.data);
	const result: CsvParseWorkerResult = error
		? { ok: false, message: error.message }
		: { ok: true, object };
	postMessage(result);
};
