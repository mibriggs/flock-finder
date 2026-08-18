<script lang="ts">
	import {
		isInDateRange,
		MAP_PANEL_CONTEXT,
		type MapPanelContext,
		type SateliteMapContext,
		SATELITE_MAP_CONTEXT,
		getCookie
	} from '$lib';
	import { browser } from '$app/environment';
	import FilterPanel from '$lib/components/filterPanel.svelte';
	import MapPanel from '$lib/components/mapPanel.svelte';
	import ResetButton from '$lib/components/resetButton.svelte';
	import { type EBirdEntry } from '$lib/eBirdEntry';
	import { fileLoadTracker } from '$lib/fileLoadingEvent.svelte';
	import { SlidersHorizontal, X, Map as MapIcon, ChartColumn } from 'lucide-svelte';
	import type { DateRange } from 'bits-ui';
	import { Tabs } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$types';
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import NoResults from '$lib/components/noResults.svelte';
	import Stats from '$lib/components/stats.svelte';

	let { data }: PageProps = $props();

	const mapPanelContext: MapPanelContext = $state({ isMapPanelUpdating: false });
	setContext(MAP_PANEL_CONTEXT, mapPanelContext);
	const sateliteMapContext: SateliteMapContext = $state({
		useSateliteMap: browser && getCookie('useSateliteView') === 'true'
	});
	setContext(SATELITE_MAP_CONTEXT, sateliteMapContext);

	let drawerOpen = $state(false);
	let currentSpecies: string[] = $state(['all']);
	let currentDateRange: DateRange = $state({ start: undefined, end: undefined });
	let committedDateRange: DateRange = $state({ start: undefined, end: undefined });
	let activeTab: string = $state('map');
	let prevEnd: DateValue | undefined = undefined;

	$effect(() => {
		const { start, end } = currentDateRange;
		if (end !== prevEnd && start && end) {
			committedDateRange = { start, end };
			mapPanelContext.isMapPanelUpdating = true;
		} else if (!start && !end) {
			committedDateRange = { start: undefined, end: undefined };
		}
		prevEnd = end;
	});

	$effect(() => {
		currentSpecies;
		mapPanelContext.isMapPanelUpdating = true;
	});

	let uniqueBirds: SvelteSet<EBirdEntry> = $derived.by(() => {
		const dateFilteredBirds =
			committedDateRange.start && committedDateRange.end
				? data.birds.filter((bird) =>
						isInDateRange(bird.date, committedDateRange.start!, committedDateRange.end!)
					)
				: data.birds;
		const seenNames = new Set<string>();
		const seen = new Map<string, EBirdEntry>();
		dateFilteredBirds.forEach((bird) => {
			if (!seen.has(bird.scientificName) && !seenNames.has(bird.commonName.trim().toWellFormed())) {
				seen.set(bird.scientificName, bird);
				seenNames.add(bird.commonName.trim().toWellFormed());
			}
		});
		return new SvelteSet(seen.values());
	});
	let filteredBirds: EBirdEntry[] = $derived.by(() => {
		let newBirds = data.birds;
		if (currentSpecies.indexOf('all') === -1) {
			newBirds = newBirds.filter((bird) => currentSpecies.includes(bird.scientificName));
		}
		if (committedDateRange.start && committedDateRange.end) {
			const start = committedDateRange.start;
			const end = committedDateRange.end;
			newBirds = newBirds.filter((bird) => isInDateRange(bird.date, start, end));
		}
		return newBirds;
	});

	const handleReset = () => {
		fileLoadTracker.reset();
		currentSpecies = ['all'];
		currentDateRange = { start: undefined, end: undefined };
		committedDateRange = { start: undefined, end: undefined };
		drawerOpen = false;
		if (browser) {
			sessionStorage.clear();
		}
		goto('/');
	};
</script>

<main class="relative flex h-dvh w-full gap-3 p-8">
	{#if data.birds.length > 0}
		<div class="absolute top-8 right-8 z-20">
			<ResetButton onclick={handleReset} />
		</div>

		<Tabs.Root bind:value={activeTab} class="flex min-h-0 flex-1 flex-col">
			<Tabs.List class="mb-4 flex gap-1 border-b border-slate-200">
				<Tabs.Trigger
					value="map"
					class="inline-flex cursor-pointer items-center gap-2 rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
				>
					<MapIcon size={16} />
					Map
				</Tabs.Trigger>
				<Tabs.Trigger
					value="analytics"
					class="inline-flex cursor-pointer items-center gap-2 rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
				>
					<ChartColumn size={16} />
					Analytics
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="map" class="hidden min-h-0 flex-1 data-[state=active]:flex">
				<!-- Mobile drawer toggle -->
				<button
					onclick={() => (drawerOpen = true)}
					class="fixed top-4 left-4 z-20 rounded-lg border border-slate-300 bg-white p-2 shadow-xs lg:hidden"
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
						'fixed top-0 left-0 z-30 flex h-full w-4/5 max-w-sm flex-col justify-between gap-2 rounded-r-xl bg-white p-4 shadow-2xl transition-transform duration-300 lg:static lg:h-auto lg:w-96 lg:translate-x-0 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none',
						drawerOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
					]}
				>
					<!-- Close button (mobile only) -->
					<div class="overflow-y-auto lg:flex-1">
						<div class="mb-3 flex justify-end lg:hidden">
							<button
								onclick={() => (drawerOpen = false)}
								class="flex items-center gap-1 rounded-full bg-red-500 p-2 text-sm font-medium text-white shadow-md transition-all active:scale-90 active:shadow-xs"
							>
								<X size={14} />
							</button>
						</div>
						<FilterPanel
							birds={uniqueBirds}
							bind:species={currentSpecies}
							bind:dateRange={currentDateRange}
						/>
					</div>
				</div>

				<div class="min-h-0 flex-1">
					<MapPanel birds={filteredBirds} taxonomyMap={data.taxonomyMap} />
				</div>
			</Tabs.Content>

			<Tabs.Content value="analytics" class="hidden min-h-0 flex-1 data-[state=active]:flex">
				<Stats birds={data.birds} />
			</Tabs.Content>
		</Tabs.Root>
	{:else}
		<NoResults onReset={handleReset} />
	{/if}
</main>
