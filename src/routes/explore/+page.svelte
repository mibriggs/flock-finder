<script lang="ts">
	import {
		MAP_PANEL_CONTEXT,
		type MapPanelContext,
		type SateliteMapContext,
		SATELITE_MAP_CONTEXT,
		getCookie
	} from '$lib';
	import { browser } from '$app/environment';
	import type { PageProps } from './$types';
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import BirdLoadingScreen from '$lib/components/birdLoadingScreen.svelte';
	import ExploreContent from '$lib/components/exploreContent.svelte';

	let { data }: PageProps = $props();

	const mapPanelContext: MapPanelContext = $state({ isMapPanelUpdating: false });
	setContext(MAP_PANEL_CONTEXT, mapPanelContext);
	const sateliteMapContext: SateliteMapContext = $state({
		useSateliteMap: browser && getCookie('useSateliteView') === 'true'
	});
	setContext(SATELITE_MAP_CONTEXT, sateliteMapContext);

	$effect(() => {
		data.birds.catch(() => {
			goto('/?uploadError=true', { replaceState: true });
		});
	});
</script>

<main class="relative flex h-dvh w-full gap-3 p-8">
	{#await data.birds}
		<BirdLoadingScreen />
	{:then birds}
		<ExploreContent {birds} taxonomyMap={data.taxonomyMap} />
	{:catch}
		<div></div>
	{/await}
</main>
