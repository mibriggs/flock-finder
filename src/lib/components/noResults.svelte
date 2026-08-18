<script lang="ts">
	import { RotateCcw } from 'lucide-svelte';

	interface Props {
		onReset: () => void;
	}

	let { onReset }: Props = $props();
</script>

<div class="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 text-center">
	<h1 class="text-3xl font-bold text-slate-800">No sightings to show</h1>
	<p class="max-w-sm text-slate-500">
		We couldn't find any bird data to display. Try uploading your eBird data again.
	</p>
	<button
		onclick={onReset}
		class="mt-3 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-xs transition-all hover:bg-slate-50 active:scale-90 active:bg-slate-100 active:shadow-none"
	>
		<RotateCcw size={16} />
		Load new file
	</button>
</div>
