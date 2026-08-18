<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { Time } from '@internationalized/date';
	import { defaultChartPadding, LineChart } from 'layerchart';
	import { SvelteMap } from 'svelte/reactivity';

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

	let timeOfDayCluster = $derived.by(() => {
		const map: SvelteMap<TimeOfDay, number> = new SvelteMap([
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
		return map;
	});

	const determineTimeOfDay = (timeSeen: string): TimeOfDay => {
		const time = parseTwelveHourTime(timeSeen);
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

	const parseTwelveHourTime = (input: string): Time => {
		const match = input.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
		if (!match) throw new Error(`Invalid time string: ${input}`);
		const [, hourStr, minuteStr, meridiem] = match;
		let hour = parseInt(hourStr, 10);
		const minute = parseInt(minuteStr, 10);
		if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
		if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
		return new Time(hour, minute);
	};
</script>

<div class="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 text-center">
	<h1 class="text-3xl font-bold text-slate-800">Coming soon</h1>
	<p class="max-w-sm text-slate-500">Analytics for your sightings are on the way.</p>
</div>
