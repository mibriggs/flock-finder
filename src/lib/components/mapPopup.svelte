<script lang="ts">
	import { ExternalLink, X } from 'lucide-svelte';

	interface Props {
		commonName: string;
		scientificName: string;
		date: string;
		location: string;
		count?: number;
		speciesCode?: string;
		onClose: () => void;
	}

	let {
		commonName,
		scientificName,
		date,
		location,
		count = undefined,
		speciesCode = undefined,
		onClose
	}: Props = $props();
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
	{#if speciesCode}
		<a
			href="https://ebird.org/species/{speciesCode}"
			target="_blank"
			rel="noopener noreferrer"
			class="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 active:bg-slate-300"
		>
			View on eBird <ExternalLink size={13} />
		</a>
	{/if}
</div>
