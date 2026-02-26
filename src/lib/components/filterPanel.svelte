<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { ChevronDown, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		disabled?: boolean;
		species?: string[];
		birds?: Set<EBirdEntry>;
	}

	type InputElementChangeEvent = Event & {
		currentTarget: EventTarget & HTMLInputElement;
	};

	let { disabled = false, species = $bindable([]), birds = new Set() }: Props = $props();
	let searchInput: string = $state('');
	let filteredBirds: EBirdEntry[] = $derived.by(() => {
		if (searchInput.trim() !== '') {
			const arrayFromSet = [...birds];
			const normalizedInput = searchInput.trim().replace(/\s+/g, ' ').toLowerCase();
			return arrayFromSet.filter(
				(bird) =>
					bird.commonName.toLowerCase().includes(normalizedInput) ||
					bird.scientificName.toLowerCase().includes(normalizedInput)
			);
		}
		return [...birds];
	});

	const deselectOtherInputs = (e: InputElementChangeEvent) => {
		if (e.currentTarget.checked) {
			species = ['all'];
		} else {
			species = [];
		}
	};

	const deselectAllInput = (e: InputElementChangeEvent, scientificName: string) => {
		if (e.currentTarget.checked && species.includes('all')) {
			species = [scientificName];
		} else if (e.currentTarget.checked) {
			species.push(scientificName);
		} else {
			species = species.filter((bird) => bird !== scientificName);
		}
	};
</script>

<div class={['flex w-full flex-col gap-2', disabled && 'pointer-events-none opacity-50']}>
	<details class="group overflow-hidden rounded-lg border border-slate-200">
		<summary
			class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
		>
			Date Range
			<ChevronDown class="h-4 w-4 transition-transform duration-500 group-open:rotate-180" />
		</summary>
		<div class="px-4 pb-3">
			<p>This content is hidden by default. It can be text, images, or any other HTML elements.</p>
		</div>
	</details>

	<details class="group overflow-hidden rounded-lg border border-slate-200">
		<summary
			class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
		>
			Species
			<ChevronDown class="h-4 w-4 transition-transform duration-500 group-open:rotate-180" />
		</summary>
		<div class="relative px-4 pb-2 pt-2">
			<input
				class="w-full rounded-md border border-slate-200 px-3 py-1.5 pr-7 text-sm outline-none focus:border-slate-400"
				type="text"
				placeholder="Search species..."
				bind:value={searchInput}
			/>
			{#if searchInput.trim() !== ''}
				<button
					transition:fade
					class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					onclick={() => (searchInput = '')}
					aria-label="Clear search"
				>
					<X size={14} />
				</button>
			{/if}
		</div>
		<div class="border-b border-slate-100 px-4">
			<label class="flex items-center gap-2 py-1.5 text-sm text-slate-700" for="all">
				<input
					type="checkbox"
					id="all"
					name="all"
					value="all"
					checked={species.includes('all')}
					onchange={(e) => deselectOtherInputs(e)}
				/>
				All ({birds.size})
			</label>
		</div>
		<div
			class="flex max-h-[calc(100vh-25rem)] flex-col divide-y divide-slate-100 overflow-y-auto px-4 pb-3"
		>
			{#each filteredBirds as bird (bird.scientificName)}
				<label
					class="flex items-center gap-2 py-1.5 text-sm text-slate-700"
					for={bird.scientificName}
				>
					<input
						type="checkbox"
						id={bird.scientificName}
						name={bird.scientificName}
						value={bird.scientificName}
						checked={species.includes(bird.scientificName)}
						onchange={(e) => deselectAllInput(e, bird.scientificName)}
					/>
					<span class="flex flex-col">
						<span>{bird.commonName}</span>
						<span class="text-xs italic text-slate-400">{bird.scientificName}</span>
					</span>
				</label>
			{/each}
		</div>
	</details>
</div>

<style>
	details[open] > div {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
