<script lang="ts">
	import { CDN_URL } from '$lib/constants';
	import { onMount } from 'svelte';

	// Gamemode
	export let gamemode: string;
	// The icon to display
	export let icon: { thumbnail: string; rotation: number };
	// The number of guesses the user has made
	export let guesses: number;
	// Whether the user has won the game
	export let hasWon: boolean;
	// Icon size
	export let size: { width: number; height: number } = { width: 96, height: 75 };

	let wrapper: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	let img: HTMLImageElement;

	$: drawImage(img, guesses, hasWon);

	onMount(() => {
		// Load and draw image
		drawCanvas();

		img = new Image();
		img.src = `${CDN_URL}/${gamemode}/${icon.thumbnail}.png`;
		img.onload = () => {
			drawImage(img, guesses, hasWon);
		};
	});

	/**
	 * Draw the	canvas to the correct size
	 */
	function drawCanvas() {
		canvas.width = wrapper.clientWidth;
		canvas.height = wrapper.clientHeight;
	}

	/**
	 * Draws the image applying correct filters based on number of guesses
	 * @param img to draw
	 * @param guesses made by the user
	 * @param hasWon whether the user has won the game
	 */
	function drawImage(img: HTMLImageElement, guesses: number, hasWon: boolean) {
		if (!canvas || !img) return;

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
	<div class="border py-2 rounded-sm">
		<div
			bind:this={wrapper}
			style="width: {size.width}px; height: {size.height}px"
			class="overflow-hidden"
		>
			<canvas bind:this={canvas}></canvas>
		</div>
	</div>
</div>
