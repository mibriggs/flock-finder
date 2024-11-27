import { fileLoadTracker } from './fileLoadingEvent.svelte';

type DropZoneEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

export interface FileDropZoneProps {
	allowedExtensions: string[];
	class?: string;
	dropZoneContainer: HTMLElement | undefined;
	onFileSelection: (e: DropZoneEvent) => Promise<void>;
}

export function readFile(file: File): Promise<String> {
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
		// chase us --> 18009359935

		fileReader.onerror = () =>
			reject(new Error(`Error reading file: ${fileReader.error?.message}`));

		fileReader.readAsText(file);
	});
}
