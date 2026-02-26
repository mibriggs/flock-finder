<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { ChevronDown } from 'lucide-svelte';

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
			return arrayFromSet.filter(
				(bird) => bird.commonName.includes(searchInput) || bird.scientificName.includes(searchInput)
			);
		}
		return [...birds];
	});

	const deselectOtherInputs = (e: InputElementChangeEvent) => {
		if (e.currentTarget.checked) {
			species = ['all'];
		}
	};

	const deselectAllInput = (e: InputElementChangeEvent) => {
		if (e.currentTarget.checked && species.includes('all')) {
			species = species.filter((bird) => bird !== 'all');
		}
	};

	const filteredListContainsValue = (scientificName: string): boolean => {
		return filteredBirds.some((fb) => fb.scientificName === scientificName);
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
		<div class="px-4 pb-2 pt-2">
			<input
				class="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400"
				type="text"
				placeholder="Search species..."
				bind:value={searchInput}
			/>
		</div>
		<div
			class="flex max-h-[calc(100vh-25rem)] flex-col divide-y divide-slate-100 overflow-y-auto px-4 pb-3"
		>
			<label class="flex items-center gap-2 py-1.5 text-sm text-slate-700" for="all">
				<input
					type="checkbox"
					id="all"
					name="all"
					value="all"
					bind:group={species}
					onchange={(e) => deselectOtherInputs(e)}
				/>
				All
			</label>
			{#each birds as bird (bird.scientificName)}
				<label
					class:hide={!filteredListContainsValue(bird.scientificName)}
					class="flex items-center gap-2 py-1.5 text-sm text-slate-700"
					for={bird.scientificName}
				>
					<input
						type="checkbox"
						id={bird.scientificName}
						name={bird.scientificName}
						value={bird.scientificName}
						bind:group={species}
						onchange={deselectAllInput}
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

	.hide {
		display: none;
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
