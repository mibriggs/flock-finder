<div class="flex h-full w-full flex-col items-center justify-center gap-4" aria-hidden="true">
	<div class="forest">
		<div class="forest-bg"></div>
		<div class="forest-scrim"></div>
		<div class="bird-sprite-frame">
			<div class="bird-sprite"></div>
		</div>
	</div>
	<p class="loading-text text-lg font-medium">Loading your sightings</p>
</div>

<style>
	.loading-text {
		color: oklch(55.4% 0.046 257.417);
	}

	.loading-text::after {
		content: '...';
		display: inline-block;
		width: 0;
		animation: dots 1.5s steps(4, end) infinite;
		overflow: hidden;
		vertical-align: bottom;
	}

	@keyframes dots {
		0%,
		100% {
			width: 0;
		}
		25% {
			width: 0.5em;
		}
		50% {
			width: 1em;
		}
		75% {
			width: 1.5em;
		}
	}

	.forest {
		position: relative;
		width: min(90vw, 900px, 100%);
		aspect-ratio: 5 / 3; /* matches forest.png's native 500x300 ratio */
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.forest-bg {
		position: absolute;
		inset: 0;
		width: 200%; /* two tiles, so the loop point is seamless */
		background-image: url('/forest.png');
		background-repeat: repeat-x;
		background-size: 50% 100%; /* each tile = the full width of .forest, whatever size it scales to */
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
			transform: translateX(-50%); /* 50% of .forest-bg's own 200% width = one tile */
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
