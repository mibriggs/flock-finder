<script lang="ts">
	import { DateRangePicker } from 'bits-ui';
	import type { DateRange } from 'bits-ui';
	import { CalendarFold, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { value = $bindable() }: { value?: DateRange } = $props();
</script>

<DateRangePicker.Root
	weekdayFormat="short"
	fixedWeeks={true}
	bind:value
	class="flex w-full max-w-[340px] flex-col gap-1.5"
>
	<DateRangePicker.Label class="block select-none pb-2 text-sm font-semibold"
		>Sighting Date</DateRangePicker.Label
	>
	<div
		class="flex w-full select-none flex-wrap items-center rounded-lg border-[2px] border-gray-200 px-3 py-2 text-sm tracking-[0.01em] focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-slate-400/30 hover:border-gray-400 md:flex-nowrap"
	>
		<DateRangePicker.Input type="start" class="flex items-center">
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

		<div class="flex w-full items-center md:w-auto md:flex-1">
			<div aria-hidden="true" class="px-1 text-gray-400">–</div>
			<DateRangePicker.Input type="end" class="flex items-center">
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
			<DateRangePicker.Trigger
				class="ml-auto inline-flex size-8 items-center justify-center rounded-[5px] text-gray-900/60 transition-all hover:bg-gray-200 active:bg-black/20"
			>
				<CalendarFold />
			</DateRangePicker.Trigger>
		</div>
	</div>
	<DateRangePicker.Content sideOffset={12} class="z-50">
		<DateRangePicker.Calendar
			class="rounded-lg border-[2px] border-gray-200 bg-white p-3 shadow-md"
		>
			{#snippet children({ months, weekdays })}
				<DateRangePicker.Header class="mb-2 flex items-center justify-between">
					<DateRangePicker.PrevButton
						class="inline-flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 active:bg-gray-200"
					>
						<ChevronLeft class="size-4" />
					</DateRangePicker.PrevButton>
					<div class="flex items-center gap-1 text-sm font-semibold text-gray-700">
						<DateRangePicker.MonthSelect
							monthFormat="short"
							class="w-fit rounded border-none focus:bg-gray-300/30 focus:ring-gray-400/40"
						/>
						<DateRangePicker.YearSelect
							class="w-fit rounded border-none focus:bg-gray-300/30 focus:ring-gray-400/40"
						/>
					</div>
					<DateRangePicker.NextButton
						class="inline-flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 active:bg-gray-200"
					>
						<ChevronRight class="size-4" />
					</DateRangePicker.NextButton>
				</DateRangePicker.Header>
				<div>
					{#each months as month (month.value)}
						<DateRangePicker.Grid class="w-full border-collapse">
							<DateRangePicker.GridHead>
								<DateRangePicker.GridRow class="flex w-full">
									{#each weekdays as day (day)}
										<DateRangePicker.HeadCell
											class="w-9 text-center text-xs font-medium text-gray-400"
										>
											<div>{day.slice(0, 2)}</div>
										</DateRangePicker.HeadCell>
									{/each}
								</DateRangePicker.GridRow>
							</DateRangePicker.GridHead>
							<DateRangePicker.GridBody>
								{#each month.weeks as weekDates (weekDates)}
									<DateRangePicker.GridRow class="flex w-full">
										{#each weekDates as date (date)}
											<DateRangePicker.Cell
												{date}
												month={month.value}
												class="relative w-9 p-0 text-center"
											>
												<DateRangePicker.Day
													class="group relative inline-flex size-9 flex-col items-center justify-center rounded-md text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-0 data-[disabled]:pointer-events-none data-[highlighted]:rounded-none data-[selection-end]:!rounded-md data-[selection-start]:!rounded-md data-[highlighted]:bg-slate-100 data-[selected]:bg-slate-100 data-[selection-end]:!bg-slate-700 data-[selection-start]:!bg-slate-700 data-[selected]:font-medium data-[outside-month]:text-gray-400 data-[selection-end]:!text-white data-[selection-start]:!text-white data-[disabled]:opacity-40"
												>
													<div
														class="absolute bottom-1 size-1 rounded-full bg-slate-400 opacity-0 group-data-[selection-end]:bg-white group-data-[selection-start]:bg-white group-data-[today]:opacity-100"
													></div>
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
