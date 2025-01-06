<script lang="ts">
	import { readCsvFile, readFile } from '$lib';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import MapPanel from '$lib/components/mapPanel.svelte';
	import { type EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';

	type BirdNames = {
		commonName: string;
		scientificName: string;
	};

	let filedDropZone: HTMLElement | undefined = $state();
	let birds: EBirdEntry[] = $state([]);
	let uniqueBirds = $derived.by(() => {
		const notSeen: BirdNames[] = [];
		birds.forEach(bird => {
			if (notSeen.findIndex(notSeenBird => notSeenBird.commonName === bird.commonName.trim().toWellFormed()) === -1) {
				notSeen.push({
					commonName: bird.commonName.trim().toWellFormed(),
					scientificName: bird.scientificName
				});
			}
		});
		return new Set(notSeen);
	});

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

		await readFile(userFile).then(async (csvData) => {
			const { object: birdData, error } = readCsvFile(csvData);
			if (error) {
				birds = [];
				await launchErrorToast(error.message);
			} else {
				birds = birdData;
			}
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
	{#if fileLoadTracker.loadComplete && birds.length > 0}
		<MapPanel {birds} />
		<select id="filter">
			{#each uniqueBirds as bird }
				<option value={bird.scientificName}>{bird.commonName}</option>
			{/each}
			<option value="all">All</option>
		  </select>
	{:else if fileLoadTracker.isLoading}
		<div>Loading...</div>
	{/if}

	<FileDropZone
		class="absolute bottom-[4%]"
		allowedExtensions={allowedFiles}
		onFileSelection={handleFileSelection}
		bind:dropZoneContainer={filedDropZone}
	/>
</main>

<!-- <Toggle
	class="h-10 w-20 after:size-[32px] after:left-1 after:top-1 peer-checked:bg-purple-500 after:peer-checked:translate-x-10 mb-24"
/> -->
<!-- No use case besides just wanted documentation on how this could be done in tw -->
