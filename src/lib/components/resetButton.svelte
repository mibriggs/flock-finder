<script lang="ts">
	import { RotateCcw } from 'lucide-svelte';

	interface Props {
		onclick: () => void;
	}
	let { onclick }: Props = $props();
</script>

<button
	{onclick}
	title="Load new file"
	class="cursor-pointer rounded-lg border border-slate-300 bg-white p-2 text-slate-600 shadow-xs transition-all hover:bg-slate-50 active:scale-90 active:bg-slate-100 active:shadow-none"
>
	<RotateCcw size={16} />
</button>
