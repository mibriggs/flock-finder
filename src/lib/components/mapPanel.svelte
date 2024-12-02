<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let { birds }: { birds: EBirdEntry[] } = $props();
	let mapContainer: HTMLDivElement;
	let map: Map;

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

		birds.forEach((bird, indx) => {
			if (indx < 100) {
				new Marker()
				.setLngLat([bird.longitude, bird.latitude])
				.setPopup(new Popup().setHTML(`
				<div class="flex flex-col m-2 items-center justify-center">
					<span class="font-bold text-sm">${bird.commonName}</span>
					<span class="italic text-xs">${bird.date.toDateString()}</span>
				</div>
				`))
				.addTo(map);
			}
		});

		return () => map.remove;
	});
</script>

<div id="map" class="h-3/4 w-full text-xs italic" bind:this={mapContainer}></div>
