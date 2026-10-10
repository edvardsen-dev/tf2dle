<script lang="ts">
	import { CDN_URL } from '#lib/constants.ts';

	interface Props {
		gamemode: string;
		icon: { thumbnail: string; rotation: number };
		guesses: number;
		hasWon: boolean;
		size?: { width: number; height: number };
		framed?: boolean;
	}
	let {
		gamemode,
		icon,
		guesses,
		hasWon,
		size = { width: 96, height: 75 },
		framed = true
	}: Props = $props();

	let wrapper = $state.raw<HTMLDivElement>();
	let canvas = $state.raw<HTMLCanvasElement>();
	let img = $state.raw<HTMLImageElement>();

	$effect(() => {
		if (!canvas || !wrapper) return;
		// Track size changes before measuring the updated DOM.
		size.width;
		size.height;
		drawCanvas();
		img = undefined;
		const image = new Image();
		image.onload = () => {
			img = image;
		};
		image.src = `${CDN_URL}/${gamemode}/${icon.thumbnail}.png`;
		return () => {
			image.onload = null;
		};
	});

	$effect(() => {
		drawImage(img, guesses, hasWon);
	});

	/**
	 * Draw the	canvas to the correct size
	 */
	function drawCanvas() {
		if (!canvas || !wrapper) return;
		canvas.width = wrapper.clientWidth;
		canvas.height = wrapper.clientHeight;
	}

	/**
	 * Draws the image applying correct filters based on number of guesses
	 * @param img to draw
	 * @param guesses made by the user
	 * @param hasWon whether the user has won the game
	 */
	function drawImage(img: HTMLImageElement | undefined, guesses: number, hasWon: boolean) {
		if (!canvas || !wrapper || !img) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		if (hasWon) {
			wrapper.style.transform = `rotate(0deg)`;
			wrapper.style.filter = 'grayscale(0)';
			ctx.filter = 'grayscale(0)';
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		} else {
			if (guesses < 3) {
				wrapper.style.transform = `rotate(${icon.rotation}deg)`;
			} else {
				wrapper.style.transform = `rotate(0deg)`;
			}
			if (guesses < 6) {
				wrapper.style.filter = 'grayscale(100%)';
				ctx.filter = 'grayscale(100%)';
			} else {
				wrapper.style.filter = 'grayscale(0)';
				ctx.filter = 'grayscale(0)';
			}

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		}
	}
</script>

<div class="flex justify-center">
	<div class={framed ? 'rounded-xl border border-border/70 bg-muted/20 p-4 shadow-sm' : ''}>
		<div
			bind:this={wrapper}
			style="width: {size.width}px; height: {size.height}px"
			class="overflow-hidden"
		>
			<canvas bind:this={canvas} aria-label="Today's game icon"></canvas>
		</div>
	</div>
</div>
