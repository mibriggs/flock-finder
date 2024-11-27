<script lang="ts">
	import { readFile } from '$lib';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import { EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';

	let filedDropZone: HTMLElement | undefined = $state();
	let birds: EBirdEntry[] = $state([]);
	let count: number[] = $state([]);

	const doNothingOnDrag = (e: DragEvent) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const handleFileSelection = async (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const files = e.currentTarget.files;
		if (files === null) return;
		await readFiles(files);
	};

	const handleFileDrag = async (e: DragEvent) => {
		e.stopPropagation();
		e.preventDefault();

		const dataTransfer = e.dataTransfer;
		if (!dataTransfer) return;

		await readFiles(dataTransfer.files);
	};

	const readFiles = async (files: FileList) => {
		if (files.length === 0) return;
		if (files.length > 1) {
			await launchErrorToast('Cannot upload more than one file at a time');
			return;
		}

		const file = files[0];
		if (file.type !== 'text/csv') {
			await launchErrorToast('Only csv files are supported at this moment');
			return;
		}

		await readFile(file)
			.then((fileText) => {
				const fileRows = fileText.split('\n');
				fileRows.forEach((row, indx) => {
					if (indx > 0 && row !== '') {
						const rowArray = row.split(',');

						const birdIndex: number = birds.findIndex(
							(birdEntry) => birdEntry.commonName === rowArray[1]
						);
						if (birdIndex !== -1) {
							// currently grouping all same birds together to reduce data a bit lol
							count[birdIndex] = count[birdIndex] + 1;
						} else {
							const birdData: EBirdEntry = new EBirdEntry(
								rowArray[0],
								rowArray[1],
								parseInt(rowArray[4]),
								rowArray[5],
								rowArray[7],
								rowArray[8],
								parseFloat(rowArray[9]),
								parseFloat(rowArray[10])
							);
							count.push(1);
							birds.push(birdData);
						}
					}
				});
				const indices: number[] = count
					.map((_, index) => index)
					.sort((a, b) => count[b] - count[a]);
				count = indices.map((index) => count[index]);
				birds = indices.map((index) => birds[index]);
			})
			.catch((error) => console.error(error));
	};

	const launchErrorToast = async (errorMessage: string) => {
		toast.error(errorMessage, {
			duration: 3000,
			closable: true
		});
	};

	$effect(() => {
		if (filedDropZone) {
			filedDropZone.ondragenter = doNothingOnDrag;
			filedDropZone.ondragover = doNothingOnDrag;
			filedDropZone.ondrop = handleFileDrag;
		}

		return () => fileLoadTracker.reset();
	});

	const allowedFiles: string[] = ['.csv'];
</script>

<main class="flex h-screen w-screen flex-col items-center gap-3 p-8">
	{#if fileLoadTracker.loadComplete}
		<div id="map" class="h-48">Map goes here</div>
	{/if}

	{#if fileLoadTracker.currentlyLoading}
		<div class="text-9xl">Loading...</div>
	{/if}

	<FileDropZone
		class="mt-8"
		allowedExtensions={allowedFiles}
		onFileSelection={handleFileSelection}
		bind:dropZoneContainer={filedDropZone}
	/>
</main>
