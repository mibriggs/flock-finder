<script lang="ts">
	import { readCsvFile, readFile, isInDateRange } from '$lib';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import FilterPanel from '$lib/components/filterPanel.svelte';
	import MapPanel from '$lib/components/mapPanel.svelte';
	import { type EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';
	import { RotateCcw, SlidersHorizontal, X } from 'lucide-svelte';
	import type { DateRange } from 'bits-ui';
	import { SvelteSet } from 'svelte/reactivity';

	let drawerOpen = $state(false);

	let filedDropZone: HTMLElement | undefined = $state();
	let birds: EBirdEntry[] = $state([]);
	let currentSpecies: string[] = $state(['all']);
	let currentDateRange: DateRange = $state({ start: undefined, end: undefined });
	let uniqueBirds: SvelteSet<EBirdEntry> = $derived.by(() => {
		const dateFilteredBirds =
			currentDateRange.start && currentDateRange.end
				? birds.filter((bird) =>
						isInDateRange(bird.date, currentDateRange.start!, currentDateRange.end!)
					)
				: birds;
		const notSeen: EBirdEntry[] = [];
		dateFilteredBirds.forEach((bird) => {
			if (
				notSeen.findIndex(
					(notSeenBird) => notSeenBird.commonName === bird.commonName.trim().toWellFormed()
				) === -1
			) {
				notSeen.push(bird);
			}
		});
		return new SvelteSet(notSeen);
	});
	let filteredBirds: EBirdEntry[] = $derived.by(() => {
		let newBirds = birds;
		if (currentSpecies.indexOf('all') === -1) {
			newBirds = newBirds.filter((bird) => currentSpecies.includes(bird.scientificName));
		}
		if (currentDateRange.start && currentDateRange.end) {
			const start = currentDateRange.start;
			const end = currentDateRange.end;
			newBirds = newBirds.filter((bird) => isInDateRange(bird.date, start, end));
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

	const loadDemo = async () => {
		fileLoadTracker.startLoading();
		const response = await fetch('/demo.csv');
		const csvData = await response.text();
		const { object: birdData, error } = readCsvFile(csvData);
		if (error) {
			await launchErrorToast(error.message);
		} else {
			birds = birdData;
			fileLoadTracker.endLoading();
		}
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
		drawerOpen = false;
	};

	const allowedFiles: string[] = ['.csv'];

	$effect(() => console.log(currentDateRange));
</script>

<main class="relative flex h-dvh w-screen gap-3 p-8">
	{#if fileLoadTracker.loadComplete && birds.length > 0}
		<!-- Mobile drawer toggle -->
		<button
			onclick={() => (drawerOpen = true)}
			class="fixed left-4 top-4 z-20 rounded-lg border border-slate-300 bg-white p-2 shadow-sm lg:hidden"
		>
			<SlidersHorizontal size={20} class="text-slate-600" />
		</button>

		<!-- Overlay -->
		{#if drawerOpen}
			<div
				class="fixed inset-0 z-20 bg-black/30 lg:hidden"
				onclick={() => (drawerOpen = false)}
				aria-hidden="true"
			></div>
		{/if}

		<!-- Sidebar / Drawer -->
		<div
			class={[
				'fixed left-0 top-0 z-30 flex h-full w-4/5 max-w-sm flex-col justify-between gap-2 rounded-r-xl bg-white p-4 shadow-2xl transition-transform duration-300 lg:static lg:w-96 lg:translate-x-0 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none',
				drawerOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
			]}
		>
			<!-- Close button (mobile only) -->
			<div class="overflow-y-auto lg:flex-1 lg:overflow-visible">
				<div class="mb-3 flex justify-end lg:hidden">
					<button
						onclick={() => (drawerOpen = false)}
						class="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white shadow-md transition-all active:scale-90 active:shadow-sm"
					>
						<X size={14} /> Close
					</button>
				</div>
				<FilterPanel
					birds={uniqueBirds}
					bind:species={currentSpecies}
					bind:dateRange={currentDateRange}
				/>
			</div>
			<button
				onclick={handleReset}
				class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-90 active:bg-slate-100 active:shadow-none"
			>
				<RotateCcw size={16} />
				Load new file
			</button>
		</div>

		<div class="flex flex-1">
			<MapPanel birds={filteredBirds} />
		</div>
	{:else if fileLoadTracker.isLoading}
		<div class="hidden w-72 lg:block">
			<FilterPanel disabled />
		</div>
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
			class="absolute bottom-[4%] left-1/2 w-[90vw] max-w-sm -translate-x-1/2"
			allowedExtensions={allowedFiles}
			onFileSelection={handleFileSelection}
			bind:dropZoneContainer={filedDropZone}
		/>
		<p
			class="absolute bottom-[1%] left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-slate-400"
		>
			or <button class="underline hover:text-slate-600" onclick={loadDemo}>try a demo</button>
		</p>
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
