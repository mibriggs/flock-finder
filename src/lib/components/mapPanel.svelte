<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { Map, NavigationControl, Popup } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { addMarkersToMap } from '$lib';
	import type { Feature, Point } from "geojson";
	import { PUBLIC_MAP_TILER_KEY } from '$env/static/public';


	let { birds }: { birds: EBirdEntry[] } = $props();
	let mapContainer: HTMLDivElement;
	let map: Map;

	$effect(() => {
		map = new Map({
			container: mapContainer,
			style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${PUBLIC_MAP_TILER_KEY}`,
			center: [-95, 40],
			zoom: 4
		});

		map.addControl(new NavigationControl());
		map.on("load", () => addMarkersToMap(birds, map));
		map.on("click", "marker-layer", (event) => {
			let birdsInArea = event.features? [...event.features] : [];
			if (birdsInArea.length > 0) {
				const selectedBird: Feature<Point> = birdsInArea[0] as Feature<Point>;
				const coordinates = selectedBird.geometry.coordinates;
				new Popup().setLngLat([coordinates[0], coordinates[1]])
				.setHTML(`<h3>${selectedBird.properties?.title}</h3><p>${selectedBird.properties?.date}</p>`)
				.addTo(map);
			}
		});

		return () => map.remove;
	});
</script>

<div id="map" class="h-3/4 w-full text-xs italic" bind:this={mapContainer}></div>
