<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { Map, NavigationControl, Popup } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { addMarkersToMap } from '$lib';
	import type { Feature, Point } from "geojson";


	let { birds }: { birds: EBirdEntry[] } = $props();
	let mapContainer: HTMLDivElement;
	let map: Map;
	// let lastClickedCoordinates: number[] = [];

	$effect(() => {
		map = new Map({
			container: mapContainer,
			style: 'https://demotiles.maplibre.org/style.json',
			// {
			//     version: 8,
			//     sources: {
			//         MIERUNEMAP: {
			//             type: 'raster',
			//             tiles: ['https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png'],
			//             tileSize: 256,
			//             attribution:
			//                 "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL."
			//         }
			//     },
			//     layers: [
			//         {
			//             id: 'MIERUNEMAP',
			//             type: 'raster',
			//             source: 'MIERUNEMAP',
			//             minzoom: 0,
			//             maxzoom: 18
			//         }
			//     ]
			// },
			center: [0, 0],
			zoom: 2
		});

		map.addControl(new NavigationControl());
		map.on("load", () => addMarkersToMap(birds, map));
		map.on("click", "marker-layer", (event) => {
			// console.log(`Last clicked coords: ${lastClickedCoordinates}`);
			let birdsInArea = event.features? [...event.features] : [];
			if (birdsInArea.length > 0) {
				const selectedBird: Feature<Point> = birdsInArea[0] as Feature<Point>;
				const coordinates = selectedBird.geometry.coordinates;
				new Popup().setLngLat([coordinates[0], coordinates[1]])
				.setHTML(`<h3>${selectedBird.properties?.title}</h3><p>${selectedBird.properties?.date}</p>`)
				.addTo(map);
				// console.log(`Selected coords: ${coordinates}`);
				// lastClickedCoordinates = coordinates;
			}
		});

		return () => map.remove;
	});
</script>

<div id="map" class="h-3/4 w-full text-xs italic" bind:this={mapContainer}></div>
