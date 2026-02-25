<script lang="ts">
	import { readCsvFile, readFile } from '$lib';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import FilterPanel from '$lib/components/filterPanel.svelte';
	import MapPanel from '$lib/components/mapPanel.svelte';
	import { type EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';
	import { RotateCcw } from 'lucide-svelte';

	let filedDropZone: HTMLElement | undefined = $state();
	let birds: EBirdEntry[] = $state([]);
	let currentSpecies: string[] = $state(['all']);
	let uniqueBirds: Set<EBirdEntry> = $derived.by(() => {
		const notSeen: EBirdEntry[] = [];
		birds.forEach((bird) => {
			if (
				notSeen.findIndex(
					(notSeenBird) => notSeenBird.commonName === bird.commonName.trim().toWellFormed()
				) === -1
			) {
				notSeen.push(bird);
			}
		});
		return new Set(notSeen);
	});
	let filteredBirds: EBirdEntry[] = $derived.by(() => {
		let newBirds: EBirdEntry[] = [];
		if (currentSpecies.indexOf('all') === -1) {
			newBirds = birds.filter((bird) => currentSpecies.indexOf(bird.scientificName) !== -1);
		} else {
			newBirds = birds;
		}
		return newBirds;
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
		fileLoadTracker.reset();
	};

	$effect(() => {
		if (filedDropZone) {
			filedDropZone.ondragenter = doNothingOnDrag;
			filedDropZone.ondragover = doNothingOnDrag;
			filedDropZone.ondrop = handleFileDrag;
		}

		return () => fileLoadTracker.reset();
	});

	const handleReset = () => {
		birds = [];
		fileLoadTracker.reset();
		currentSpecies = ['all'];
	};

	const allowedFiles: string[] = ['.csv'];
</script>

<main class="relative flex h-screen w-screen gap-3 p-8">
	{#if fileLoadTracker.loadComplete && birds.length > 0}
		<div class="flex w-72 flex-col justify-between gap-2">
			<FilterPanel birds={uniqueBirds} bind:species={currentSpecies} />
			<button
				onclick={handleReset}
				class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 active:bg-slate-100"
			>
				<RotateCcw size={16} />
				Load new file
			</button>
		</div>
		<div class="flex flex-1">
			<MapPanel birds={filteredBirds} />
		</div>
	{:else if fileLoadTracker.isLoading}
		<FilterPanel disabled />
		<div
			class="flex h-full flex-1 animate-pulse items-center justify-center rounded-lg bg-slate-200"
		>
			<svg
				class="h-10 w-10 animate-spin text-slate-400"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
		</div>
	{/if}

	<div class={fileLoadTracker.loadComplete || fileLoadTracker.isSelected ? 'hide' : ''}>
		<FileDropZone
			class="absolute bottom-[4%] left-1/2 -translate-x-1/2"
			allowedExtensions={allowedFiles}
			onFileSelection={handleFileSelection}
			bind:dropZoneContainer={filedDropZone}
		/>
	</div>
</main>

<!-- <Toggle
	class="h-10 w-20 after:size-[32px] after:left-1 after:top-1 peer-checked:bg-purple-500 after:peer-checked:translate-x-10 mb-24"
/> -->
<!-- No use case besides just wanted documentation on how this could be done in tw -->

<style>
	.hide {
		display: none;
	}
</style>
