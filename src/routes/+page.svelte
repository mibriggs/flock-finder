<script lang="ts">
	import {
		readFile,
		MAP_PANEL_CONTEXT,
		type MapPanelContext,
		type SateliteMapContext,
		SATELITE_MAP_CONTEXT,
		getCookie
	} from '$lib';
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

		await readFile(userFile).then(async (csvData) => {
			if (browser) {
				console.log(new Blob([csvData]).size);
				new Response(new Blob([csvData]).stream().pipeThrough(new CompressionStream('gzip')))
					.blob()
					.then((b) => console.log(b.size));
				sessionStorage.setItem('csv', csvData);
			}
		});
		goto('/explore');
	};

	const loadDemo = async () => {
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

<main class="relative flex h-dvh w-full gap-3 p-8">
	<div class={fileLoadTracker.loadComplete || fileLoadTracker.isSelected ? 'hide' : ''}>
		<EBirdInstructions />
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
