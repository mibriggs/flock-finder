<script lang="ts">
	import TimeOfDayHistogram from './timeOfDayHistogram.svelte';
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { LineChart, defaultChartPadding, type ChartState } from 'layerchart';
	import { scaleTime } from 'd3-scale';
	import { extent } from 'd3-array';

	interface Props {
		birds: EBirdEntry[];
	}

	let { birds = [] }: Props = $props();

	let context = $state<ChartState>(null!);

	const birdsSorted = $derived.by(() => {
		console.time('[timing] stats: sort birds by date');
		const sorted = birds.toSorted((a, b) => a.date.getTime() - b.date.getTime());
		console.timeEnd('[timing] stats: sort birds by date');
		return sorted;
	});

	// one point per calendar date (real dates, not bucketed) - multiple sightings on the
	// same date collapse into a single point since bird.date has no time component
	const accumulationCurveData = $derived.by(() => {
		console.time('[timing] stats: build accumulationCurveData');
		const seen = new Set<string>();
		const byDate: { date: Date; cumulativeSpecies: number }[] = [];
		for (const bird of birdsSorted) {
			seen.add(bird.commonName);
			const lastPoint = byDate.at(-1);
			if (lastPoint && lastPoint.date.getTime() === bird.date.getTime()) {
				lastPoint.cumulativeSpecies = seen.size;
			} else {
				byDate.push({ date: bird.date, cumulativeSpecies: seen.size });
			}
		}
		console.timeEnd('[timing] stats: build accumulationCurveData');
		return byDate;
	});

	const xDomain = $derived(extent(accumulationCurveData, (d) => d.date) as [Date, Date]);
	const maxCumulative = $derived(accumulationCurveData.at(-1)?.cumulativeSpecies ?? 0);
	// rough estimate: ~7px per character plus a little breathing room
	const leftPadding = $derived(Math.max(25, `${maxCumulative.toLocaleString()}`.length * 7 + 10));
</script>

<div class="flex w-full flex-col gap-2.5">
	<TimeOfDayHistogram {birds} />

	<div class="flex w-full flex-col items-center gap-2">
		<p class="text-lg font-semibold italic">Species Accumulation Curve</p>

		<LineChart
			bind:context
			data={accumulationCurveData}
			x="date"
			xScale={scaleTime()}
			y="cumulativeSpecies"
			{xDomain}
			height={300}
			transform={{
				mode: 'domain',
				axis: 'x',
				scaleExtent: [1, 50],
				domainExtent: { x: { min: xDomain[0], max: xDomain[1] } }
			}}
			motion={{ type: 'spring' }}
			clip
			padding={defaultChartPadding({ left: leftPadding })}
			brush
		/>
	</div>
</div>
