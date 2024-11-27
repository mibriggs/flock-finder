<script lang="ts">
    import { Map } from "maplibre-gl";

    let mapContainer: HTMLDivElement;
    let map: Map;
    $effect(() => {
        map = new Map({
            container: mapContainer,
            style: {
                version: 8,
                sources: {
                    MIERUNEMAP: {
                        type: 'raster',
                        tiles: ['https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution:
                            "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL."
                    }
                },
                layers: [
                    {
                        id: 'MIERUNEMAP',
                        type: 'raster',
                        source: 'MIERUNEMAP',
                        minzoom: 0,
                        maxzoom: 18
                    }
                ]
            },
            center: [-85, 40],
            zoom: 2.5

        });

        return () => map.remove;
    });
</script>
<div id="map" class="h-3/4 w-full text-xs italic" bind:this={mapContainer}></div>