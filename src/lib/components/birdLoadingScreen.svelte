<div class="flex h-full w-full flex-col items-center justify-center gap-4" aria-hidden="true">
	<div class="bird-sprite-frame">
		<div class="bird-sprite"></div>
	</div>
	<p class="text-lg font-medium text-slate-500">Loading your sightings…</p>
</div>

<style>
	.bird-sprite-frame {
		width: 96px; /* one frame, scaled 2x from the native 48px */
		height: 96px;
		overflow: hidden;
	}

	.bird-sprite {
		width: 576px; /* native sheet (288x48) scaled 2x */
		height: 96px;
		background-image: url('/sacred_kingfisher.png');
		background-repeat: no-repeat;
		background-size: 576px 96px;
		animation: flap 0.8s steps(6) infinite;
		will-change: transform;
		image-rendering: pixelated;
	}

	@keyframes flap {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-576px);
		} /* full scaled sheet width: 96px × 6 frames */
	}
</style>
