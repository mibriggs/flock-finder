<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import TimeOfDayHistogram from './timeOfDayHistogram.svelte';

	interface Props {
		birds: EBirdEntry[];
	}

	let { birds = [] }: Props = $props();
</script>

<TimeOfDayHistogram {birds} />
