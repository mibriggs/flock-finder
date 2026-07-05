<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import {
		FullscreenControl,
		GeoJSONSource,
		Map as MapboxMap,
		NavigationControl,
		Popup,
		type MapLayerMouseEvent
	} from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import {
		addMarkersToMap,
		formatDate,
		type BirdFeatureProperties,
		MAP_PANEL_CONTEXT,
		type MapPanelContext,
		type SateliteMapContext,
		SATELITE_MAP_CONTEXT
	} from '$lib';
	import type { Feature, Point, Position } from 'geojson';
	import { getContext, mount, unmount } from 'svelte';
	import MapPopup from './mapPopup.svelte';
	import { PUBLIC_MAP_TILER_KEY } from '$env/static/public';

	interface Props {
		birds: EBirdEntry[];
		taxonomyMap?: Map<string, string>;
	}
	let { birds, taxonomyMap = undefined }: Props = $props();
	let mapContainer: HTMLDivElement;
	let map: MapboxMap;
	const mapPanelContext = getContext<MapPanelContext>(MAP_PANEL_CONTEXT);
	const sateliteMapContext = getContext<SateliteMapContext>(SATELITE_MAP_CONTEXT);

	let savedCenter: [number, number] | undefined = $state();
	let savedZoom: number | undefined = $state();

	const getMapStyle = () => {
		return sateliteMapContext.useSateliteMap
			? `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${PUBLIC_MAP_TILER_KEY}`
			: 'https://tiles.openfreemap.org/styles/positron';
	};

	$effect(() => {
		const features = birds.map((bird) => ({
			type: 'Feature' as const,
			geometry: {
				type: 'Point' as const,
				coordinates: [
					bird.longitude + (Math.random() - 0.5) * 0.0005,
					bird.latitude + (Math.random() - 0.5) * 0.0005
				]
			},
			properties: {
				title: bird.commonName,
				date: formatDate(bird.date),
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
		map = new MapboxMap({
			container: mapContainer,
			style: getMapStyle(),
			center: savedCenter ?? [-95, 40],
			zoom: savedZoom ?? 4
		});

		map.addControl(new NavigationControl());
		map.addControl(new FullscreenControl());
		map.on('load', async () => await addMarkersToMap(birds, map));
		map.on('idle', () => {
			mapPanelContext.isMapPanelUpdating = false;
		});
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

		return () => {
			savedCenter = [map.getCenter().lng, map.getCenter().lat];
			savedZoom = map.getZoom();
			map.remove();
		};
	});

	const drawPopupPanel = (bird: Feature<Point, BirdFeatureProperties>) => {
		const coords: Position = bird.geometry.coordinates;
		const container: HTMLDivElement = document.createElement('div');
		const popup = new Popup({ closeButton: false });
		const taxonomicOrder = taxonomyMap?.get(bird.properties.scientificName.trim().toLowerCase());
		const instance = mount(MapPopup, {
			target: container,
			props: {
				commonName: bird.properties.title,
				scientificName: bird.properties.scientificName,
				date: bird.properties.date,
				location: bird.properties.location,
				count: bird.properties.count,
				speciesCode: taxonomicOrder,
				onClose: () => popup.remove()
			}
		});

		popup.setLngLat([coords[0], coords[1]]).setDOMContent(container).addTo(map);

		popup.on('close', () => unmount(instance));
	};
</script>

<div class="relative h-full w-full">
	<div id="map" class="h-full w-full text-xs italic" bind:this={mapContainer}></div>
	{#if mapPanelContext.isMapPanelUpdating}
		<div
			class="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs text-slate-500 shadow-sm backdrop-blur-sm"
		>
			<svg
				class="h-3.5 w-3.5 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
			Updating…
		</div>
	{/if}
</div>

<style>
	:global(.maplibregl-popup-content) {
		border-radius: 0.5rem !important;
		padding: 0 !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
		overflow: visible !important;
	}
</style>
