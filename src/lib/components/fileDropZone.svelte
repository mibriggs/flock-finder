<script lang="ts">
	import type { FileDropZoneProps } from '$lib';
	import { Upload } from 'lucide-svelte';

	let {
		allowedExtensions = [],
		dropZoneContainer = $bindable(),
		onFileSelection
	}: FileDropZoneProps = $props();

	const humanReadableExtensions = $derived(
		allowedExtensions.map((extension) => extension.replace('.', '').toUpperCase())
	);
</script>

<label
	for="fileUpload"
	class="my-8 flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-gray-400 bg-gray-100 p-8 text-gray-600 hover:opacity-70 active:border-green-500"
	bind:this={dropZoneContainer}
	draggable="false"
>
	<Upload size="32" />
	<div class="text-center text-xl">
		<span class="font-bold">Upload a file</span>
		<span>or drag and drop</span>
	</div>
	<div class="text-sm italic">{humanReadableExtensions.join(', ')} allowed</div>
</label>
<input
	class="hidden"
	type="file"
	name="fileToUpload"
	id="fileUpload"
	accept={allowedExtensions.join(',')}
	multiple={false}
	onchange={onFileSelection}
/>
