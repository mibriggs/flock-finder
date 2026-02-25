<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { ChevronDown } from 'lucide-svelte';

	interface Props {
		disabled?: boolean;
		birds?: Set<EBirdEntry>;
	}
	let { disabled = false, birds = new Set() }: Props = $props();
</script>

<div class={['flex w-72 flex-col gap-2', disabled && 'pointer-events-none opacity-50']}>
	<details class="group rounded-lg border border-slate-200">
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

	<details class="group rounded-lg border border-slate-200">
		<summary
			class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
		>
			Species
			<ChevronDown class="h-4 w-4 transition-transform duration-500 group-open:rotate-180" />
		</summary>
		<div class="flex max-h-[45rem] flex-col gap-1 overflow-y-auto px-4 pb-3">
			{#each birds as bird}
				<label class="flex items-center gap-2 text-sm text-slate-700" for={bird.scientificName}>
					<input
						type="checkbox"
						id={bird.scientificName}
						name={bird.scientificName}
						value={bird.scientificName}
					/>
					{bird.commonName}
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
