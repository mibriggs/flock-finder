<script lang="ts">
	import { parseTime } from '$lib';
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';

	interface Props {
		birds: EBirdEntry[];
	}

	type TimeOfDay =
		| 'Dawn (5-8am)'
		| 'Morning (8-11am)'
		| 'Midday (11am-3pm)'
		| 'Evening (3-7pm)'
		| 'Night (7pm-5am)';

	let { birds = [] }: Props = $props();

	let timeOfDayCluster: { timeOfDay: TimeOfDay; value: number }[] = $derived.by(() => {
		const map: Map<TimeOfDay, number> = new Map([
			['Dawn (5-8am)', 0],
			['Morning (8-11am)', 0],
			['Midday (11am-3pm)', 0],
			['Evening (3-7pm)', 0],
			['Night (7pm-5am)', 0]
		]);
		birds
			.map((bird) => bird.time)
			.filter((time): time is string => time !== undefined)
			.forEach((time) => {
				const timeOfDay = determineTimeOfDay(time);
				const oldCount = map.get(timeOfDay) ?? 0;
				map.set(timeOfDay, oldCount + 1);
			});

		const asArray: { timeOfDay: TimeOfDay; value: number }[] = [];
		map.forEach((val, key) => {
			asArray.push({ timeOfDay: key, value: val });
		});
		return asArray;
	});

	const determineTimeOfDay = (timeSeen: string): TimeOfDay => {
		const time = parseTime(timeSeen);
		const hour = time.hour;
		if (hour >= 5 && hour < 8) {
			return 'Dawn (5-8am)';
		} else if (hour >= 8 && hour < 11) {
			return 'Morning (8-11am)';
		} else if (hour >= 11 && hour < 15) {
			return 'Midday (11am-3pm)';
		} else if (hour >= 15 && hour < 19) {
			return 'Evening (3-7pm)';
		} else {
			return 'Night (7pm-5am)';
		}
	};

	function formatTimeOfDay(value: unknown) {
		return String(value).replaceAll(/\s*\([^)]*\)/g, '');
	}
</script>

<div class="flex w-full flex-col items-center gap-2">
	<p class="text-lg font-semibold italic">Total Sightings per Time of Day</p>
	<div class="w-full md:w-3/4 lg:w-1/4">
		<BarChart
			data={timeOfDayCluster}
			x="timeOfDay"
			xScale={scaleBand().padding(0)}
			y="value"
			height={300}
			props={{ bars: { color: '#007a55', radius: 1 }, xAxis: { format: formatTimeOfDay } }}
		/>
	</div>
</div>
