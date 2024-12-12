<script lang="ts">
	import { readCsvFile, readFile } from '$lib';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import MapPanel from '$lib/components/mapPanel.svelte';
	import { type EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';

	let filedDropZone: HTMLElement | undefined = $state();
	let birds: EBirdEntry[] = $state([]);

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

		const userFile = files[0];
		if (userFile.type !== 'text/csv') {
			await launchErrorToast('Only csv files are supported at this moment');
			return;
		}

		await readFile(userFile)
			.then((csvData) => (birds = readCsvFile(csvData)))
			.catch((error) => {
				console.error(error);
				launchErrorToast(error);
			});
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
		<MapPanel {birds} />
	{/if}

	{#if fileLoadTracker.isLoading}
		<div>Loading...</div>
	{/if}

	<FileDropZone
		class="mt-8"
		allowedExtensions={allowedFiles}
		onFileSelection={handleFileSelection}
		bind:dropZoneContainer={filedDropZone}
	/>
</main>

<!-- <Toggle
	class="h-10 w-20 after:size-[38px] peer-checked:bg-purple-500 after:peer-checked:translate-x-10"
/> -->
<!-- No use case besides just wanted documentation on how this could be done in tw -->
