<script lang="ts">
	import { X } from 'lucide-svelte';

	interface Props {
		commonName: string;
		scientificName: string;
		date: string;
		location: string;
		count?: number;
		onClose: () => void;
	}

	let { commonName, scientificName, date, location, count = undefined, onClose }: Props = $props();
</script>

<div class="relative flex min-w-[200px] flex-col gap-1 rounded-xl p-2">
	<button
		class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
		onclick={onClose}
	>
		<X size={14} />
	</button>
	<h3 class="pr-8 text-lg font-bold text-slate-800">{commonName}</h3>
	<p class="text-sm italic text-slate-600">{scientificName}</p>
	<div class="my-1 h-px bg-slate-200"></div>
	<div class="flex flex-col gap-0.5 text-sm text-slate-700">
		<p><span class="font-semibold">Date:</span> {date}</p>
		<p><span class="font-semibold">Location:</span> {location}</p>
		{#if count}
			<p><span class="font-semibold">Count:</span> {count}</p>
		{/if}
	</div>
</div>
