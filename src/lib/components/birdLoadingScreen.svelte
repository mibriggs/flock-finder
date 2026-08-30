<div class="flex h-full w-full flex-col items-center justify-center gap-4" aria-hidden="true">
	<div class="forest">
		<div class="forest-bg"></div>
		<div class="forest-scrim"></div>
		<div class="bird-sprite-frame">
			<div class="bird-sprite"></div>
		</div>
	</div>
	<p class="text-lg font-medium text-slate-500">Loading your sightings…</p>
</div>

<style>
	.forest {
		position: relative;
		width: 500px;
		height: 300px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.forest-bg {
		position: absolute;
		inset: 0;
		width: 1000px; /* two tiles, so the loop point is seamless */
		background-image: url('/forest.png');
		background-repeat: repeat-x;
		background-size: 500px 300px;
		animation: scroll-forest 8s linear infinite;
		will-change: transform;
	}

	.forest-scrim {
		position: absolute;
		inset: 0;
		background-color: black;
		opacity: 0.4;
	}

	@keyframes scroll-forest {
		from {
			transform: translateX(-500px); /* exactly one tile width */
		}
		to {
			transform: translateX(0);
		}
	}

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
