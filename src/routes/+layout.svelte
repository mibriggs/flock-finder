<script lang="ts">
	import '../app.css';
	import { Toasts } from 'svoast';

	let { children } = $props();
</script>

<Toasts />
{@render children()}
