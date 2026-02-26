<script lang="ts">
	import { DateRangePicker } from 'bits-ui';
	import { CalendarFold, ChevronLeft, ChevronRight } from 'lucide-svelte';
</script>

<DateRangePicker.Root
	weekdayFormat="short"
	fixedWeeks={true}
	class="flex w-full max-w-[340px] flex-col gap-1.5"
>
	<DateRangePicker.Label class="block select-none pb-2 text-sm font-semibold"
		>Sighting Date</DateRangePicker.Label
	>
	<div
		class="flex h-10 w-full select-none items-center rounded-lg border-[2px] border-gray-200 px-3 py-2 text-sm tracking-[0.01em] focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-slate-400/30 hover:border-gray-400"
	>
		{#each ['start', 'end'] as const as type (type)}
			<DateRangePicker.Input {type} class="flex items-center">
				{#snippet children({ segments })}
					{#each segments as { part, value }, i (part + i)}
						<div class="inline-block select-none">
							{#if part === 'literal'}
								<DateRangePicker.Segment {part} class="p-1 text-gray-400">
									{value}
								</DateRangePicker.Segment>
							{:else}
								<DateRangePicker.Segment
									{part}
									class="focus-visible:ring-0! focus-visible:ring-offset-0! rounded p-1 text-sm text-gray-700 hover:bg-gray-200/50 focus:bg-gray-200 focus:text-gray-600 aria-[valuetext=Empty]:text-gray-500"
								>
									{value}
								</DateRangePicker.Segment>
							{/if}
						</div>
					{/each}
				{/snippet}
			</DateRangePicker.Input>
			{#if type === 'start'}
				<div aria-hidden="true" class="px-1 text-gray-400">–</div>
			{/if}
		{/each}

		<DateRangePicker.Trigger class="ml-auto">
			<CalendarFold />
		</DateRangePicker.Trigger>
	</div>
	<DateRangePicker.Content sideOffset={6} class="z-50">
		<DateRangePicker.Calendar>
			{#snippet children({ months, weekdays })}
				<DateRangePicker.Header>
					<DateRangePicker.PrevButton>
						<ChevronLeft />
					</DateRangePicker.PrevButton>
					<!-- <DateRangePicker.Heading /> -->
					<div>
						<DateRangePicker.Heading />
						<DateRangePicker.MonthSelect />
						<DateRangePicker.YearSelect />
					</div>
					<DateRangePicker.NextButton>
						<ChevronRight />
					</DateRangePicker.NextButton>
				</DateRangePicker.Header>
				<div>
					{#each months as month (month.value)}
						<DateRangePicker.Grid>
							<DateRangePicker.GridHead>
								<DateRangePicker.GridRow>
									{#each weekdays as day (day)}
										<DateRangePicker.HeadCell>
											<div>{day.slice(0, 2)}</div>
										</DateRangePicker.HeadCell>
									{/each}
								</DateRangePicker.GridRow>
							</DateRangePicker.GridHead>
							<DateRangePicker.GridBody>
								{#each month.weeks as weekDates (weekDates)}
									<DateRangePicker.GridRow class="flex w-full">
										{#each weekDates as date (date)}
											<DateRangePicker.Cell {date} month={month.value}>
												<DateRangePicker.Day>
													<div></div>
													{date.day}
												</DateRangePicker.Day>
											</DateRangePicker.Cell>
										{/each}
									</DateRangePicker.GridRow>
								{/each}
							</DateRangePicker.GridBody>
						</DateRangePicker.Grid>
					{/each}
				</div>
			{/snippet}
		</DateRangePicker.Calendar>
	</DateRangePicker.Content>
</DateRangePicker.Root>
