<script lang="ts">
	import '../app.css';
	import { Toasts } from 'svoast';
	import { navigating } from '$app/state';
	import BirdLoadingScreen from '$lib/components/birdLoadingScreen.svelte';

	let { children } = $props();
	let showSpinner: boolean = $state(false);
	const slowRoutes: string[] = ['/explore'];

	$effect(() => {
		const shouldDebounce = navigating.to && slowRoutes.includes(navigating.to.route.id ?? '');

		if (!shouldDebounce) {
			showSpinner = false;
			return;
		}

		const timeout = setTimeout(() => (showSpinner = true), 100);
		return () => clearTimeout(timeout);
	});
</script>

<Toasts />

{#if showSpinner}
	<div class="flex h-screen w-screen items-center justify-center">
		<BirdLoadingScreen />
	</div>
{:else}
	{@render children()}
{/if}
