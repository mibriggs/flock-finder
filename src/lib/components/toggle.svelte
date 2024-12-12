<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	interface Props {
		class?: string;
	}

	const checkboxId: string = crypto.randomUUID();
	let { class: className = '' }: Props = $props();
</script>

<div class="flex items-center justify-center">
	<input type="checkbox" class="peer sr-only" id={checkboxId} />
	<label
		class={twMerge(
			"relative inline-block h-5 w-10 cursor-pointer items-center justify-center rounded-3xl bg-gray-400 after:absolute after:left-[1px] after:top-[1px] after:size-[18px] after:rounded-full after:bg-white after:transition-all after:duration-300 after:content-[''] peer-checked:bg-green-400 after:peer-checked:translate-x-[20px]",
			className
		)}
		for={checkboxId}
	>
	</label>
</div>
