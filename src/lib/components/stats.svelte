<script lang="ts">
	import type { EBirdEntry } from '$lib/eBirdEntry';
	import { Time } from '@internationalized/date';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		birds: EBirdEntry[];
	}
	type TimeOfDay = 'Morning' | 'Afternoon' | 'Night';

	let { birds = [] }: Props = $props();
	let timeOfDayCluster = $derived.by(() => {
		const map: SvelteMap<TimeOfDay, number> = new SvelteMap([
			['Morning', 0],
			['Afternoon', 0],
			['Night', 0]
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
		console.log(time);
		if (time.hour >= 5 && time.hour < 12) {
			return 'Morning';
		} else if (time.hour >= 12 && time.hour < 18) {
			return 'Afternoon';
		} else {
			return 'Night';
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

	$effect(() => {
		console.log(timeOfDayCluster);
		console.log(birds.length)
	});
</script>
