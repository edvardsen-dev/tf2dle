<script lang="ts">
	interface Props {
		url: string;
		startingPos: { x: number; y: number };
		numberOfGuesses: number;
		hasWon: boolean;
		mapName: string;
	}
	let { url, startingPos, numberOfGuesses, hasWon, mapName }: Props = $props();

	const STEPS = 11;

	let container = $state.raw<HTMLDivElement>();
	let canvas = $state.raw<HTMLCanvasElement>();
	let img = $state.raw<HTMLImageElement>();

	$effect(() => {
		img = undefined;
		const image = new Image();
		image.onload = () => {
			img = image;
			handleWindowResize();
		};
		image.src = url;
		return () => {
			image.onload = null;
		};
	});

	$effect(() => {
		drawImage(img, numberOfGuesses, hasWon);
	});

	/**
	 * Redraw canvas and image when window is resized
	 */
	function handleWindowResize() {
		if (!container || !canvas) return;
		const { width, height } = container.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		drawImage(img, numberOfGuesses, hasWon);
	}

	/**
	 * Draws the image, applying correct zoom based on number of guesses
	 * @param img to draw
	 * @param guesses the user has made
	 * @param hasWon whether the user has won the game
	 */
	function drawImage(img: HTMLImageElement | undefined, guesses: number, hasWon: boolean) {
		if (!canvas || !img) return;

		if (guesses >= STEPS) guesses = STEPS - 1;

		const ctx = canvas.getContext('2d');

		if (hasWon) {
			ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			return;
		}

		const cropWidth = img.width / (STEPS - guesses);
		const cropHeight = img.height / (STEPS - guesses);

		let sX = startingPos.x - startingPos.x / (STEPS - guesses);
		if (sX < 0) sX = 0;
		if (sX + cropWidth > img.width) sX = img.width - cropWidth;

		let sY = startingPos.y - startingPos.y / (STEPS - guesses);
		if (sY < 0) sY = 0;
		if (sY + cropHeight > img.height) sY = img.height - cropHeight;

		ctx?.drawImage(img, sX, sY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
	}
</script>

<svelte:window onresize={handleWindowResize} />

<div>
	<div
		class="relative overflow-hidden aspect-video rounded-lg border border-border bg-muted"
		bind:this={container}
	>
		<div class="absolute inset-0 bg-muted animate-pulse"></div>
		<canvas
			bind:this={canvas}
			class="absolute w-full h-full"
			aria-label={hasWon ? mapName : "Today's map clue"}
		></canvas>
		{#if hasWon}
			<div
				class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4 pt-12"
			>
				<div
					class="mx-auto w-fit rounded-lg border border-primary/30 bg-background/90 px-4 py-2 text-center shadow-lg shadow-background/40 backdrop-blur"
				>
					<p class="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
						Map revealed
					</p>
					<p class="text-lg font-semibold text-foreground">{mapName}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
