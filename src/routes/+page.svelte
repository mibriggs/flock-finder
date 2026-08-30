<script lang="ts">
	import {
		readFile,
		MAP_PANEL_CONTEXT,
		type MapPanelContext,
		type SateliteMapContext,
		SATELITE_MAP_CONTEXT,
		getCookie
	} from '$lib';
	import { saveCsv, clearCsv } from '$lib/csvStore';
	import { browser } from '$app/environment';
	import FileDropZone from '$lib/components/fileDropZone.svelte';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { toast } from 'svoast';
	import { setContext } from 'svelte';
	import EBirdInstructions from '$lib/components/eBirdInstructions.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';

	const mapPanelContext: MapPanelContext = $state({ isMapPanelUpdating: false });
	setContext(MAP_PANEL_CONTEXT, mapPanelContext);
	const sateliteMapContext: SateliteMapContext = $state({
		useSateliteMap: browser && getCookie('useSateliteView') === 'true'
	});
	setContext(SATELITE_MAP_CONTEXT, sateliteMapContext);

	let filedDropZone: HTMLElement | undefined = $state();

	$effect(() => {
		if (filedDropZone) {
			filedDropZone.ondragenter = doNothingOnDrag;
			filedDropZone.ondragover = doNothingOnDrag;
			filedDropZone.ondrop = handleFileDrag;
		}

		return () => fileLoadTracker.reset();
	});

	afterNavigate(() => {
		if (page.url.searchParams.has('uploadError')) {
			launchErrorToast('Something went wrong loading your data. Please try again.');
			goto('/', { replaceState: true, noScroll: true, keepFocus: true });
		}
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

		try {
			const csvData = await readFile(userFile);
			await saveCsv(csvData);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'QuotaExceededError') {
				await launchErrorToast('This file is too large to load. Try a smaller export.');
			} else {
				await launchErrorToast('Something went wrong loading your data. Please try again.');
			}
			return;
		}

		goto('/explore');
	};

	const loadDemo = async () => {
		await clearCsv();
		goto('/explore');
	};

	const launchErrorToast = async (errorMessage: string) => {
		toast.error(errorMessage, {
			duration: 3000,
			closable: true
		});
		fileLoadTracker.reset();
	};

	const allowedFiles: string[] = ['.csv'];
</script>

<main class="relative flex h-dvh w-full p-4 sm:p-8">
	<div
		class="flex h-full w-full flex-col items-center justify-between gap-3 overflow-y-auto sm:gap-6 {fileLoadTracker.loadComplete ||
		fileLoadTracker.isSelected
			? 'hide'
			: ''}"
	>
		<div class="flex flex-1 items-center justify-center">
			<EBirdInstructions />
		</div>
		<div class="flex flex-col items-center gap-2 sm:gap-3">
			<FileDropZone
				class="w-full max-w-sm"
				allowedExtensions={allowedFiles}
				onFileSelection={handleFileSelection}
				bind:dropZoneContainer={filedDropZone}
			/>
			<p class="text-sm whitespace-nowrap text-slate-400">
				or <button class="cursor-pointer underline hover:text-slate-600" onclick={loadDemo}
					>try a demo</button
				>
			</p>
		</div>
	</div>
</main>

<!-- <Toggle
	class="h-10 w-20 after:size-[32px] after:left-1 after:top-1 peer-checked:bg-purple-500 peer-checked:after:translate-x-10 mb-24"
/> -->
<!-- No use case besides just wanted documentation on how this could be done in tw -->

<style>
	.hide {
		display: none;
	}
</style>
