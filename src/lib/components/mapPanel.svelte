<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import {
		FullscreenControl,
		GeoJSONSource,
		Map,
		NavigationControl,
		Popup,
		type MapLayerMouseEvent
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { addMarkersToMap, type BirdFeatureProperties } from '$lib';
	import type { Feature, Point, Position } from 'geojson';
	import { mount, unmount } from 'svelte';
	import MapPopup from './mapPopup.svelte';

	let { birds }: { birds: EBirdEntry[] } = $props();
	let mapContainer: HTMLDivElement;
	let map: Map;

	$effect(() => {
		const features = birds.map((bird) => ({
			type: 'Feature' as const,
			geometry: { type: 'Point' as const, coordinates: [bird.longitude + (Math.random() - 0.5) * 0.0005, bird.latitude + (Math.random() - 0.5) * 0.0005] },
			properties: {
				title: bird.commonName,
				date: bird.date,
				scientificName: bird.scientificName,
				count: bird.count,
				location: bird.location
			}
		}));
		const source = map?.getSource('markers') as GeoJSONSource | undefined;

		if (!source) return;
		source.setData({ type: 'FeatureCollection', features });
	});

	$effect(() => {
		map = new Map({
			container: mapContainer,
			style: 'https://tiles.openfreemap.org/styles/positron',
			center: [-95, 40],
			zoom: 4
		});

		map.addControl(new NavigationControl());
		map.addControl(new FullscreenControl());
		map.on('load', async () => await addMarkersToMap(birds, map));
		map.on('click', 'marker-layer', (event: MapLayerMouseEvent) => {
			let birdsInArea = event.features ? [...event.features] : [];
			if (birdsInArea.length > 0) {
				drawPopupPanel(birdsInArea[0] as unknown as Feature<Point, BirdFeatureProperties>);
			}
		});
		map.on('click', 'clusters', async (event: MapLayerMouseEvent) => {
			const features = event.features;
			if (!features || features.length === 0) return;

			const clusterId = features[0].properties.cluster_id;
			const source = map.getSource('markers') as GeoJSONSource;

			const zoomNumber = await source.getClusterExpansionZoom(clusterId);
			map.easeTo({
				center: (features[0].geometry as Point).coordinates as [number, number],
				zoom: zoomNumber
			});
		});

		return () => map.remove();
	});

	const drawPopupPanel = (bird: Feature<Point, BirdFeatureProperties>) => {
		const coords: Position = bird.geometry.coordinates;
		const container: HTMLDivElement = document.createElement('div');
		const popup = new Popup({ closeButton: false });

		const instance = mount(MapPopup, {
			target: container,
			props: {
				commonName: bird.properties.title,
				scientificName: bird.properties.scientificName,
				date: bird.properties.date,
				location: bird.properties.location,
				count: bird.properties.count,
				onClose: () => popup.remove()
			}
		});

		popup.setLngLat([coords[0], coords[1]]).setDOMContent(container).addTo(map);

		popup.on('close', () => unmount(instance));
	};
</script>

<div id="map" class="h-full w-full text-xs italic" bind:this={mapContainer}></div>

<style>
	:global(.maplibregl-popup-content) {
		border-radius: 0.5rem !important;
		padding: 0 !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
		overflow: visible !important;
	}
</style>
