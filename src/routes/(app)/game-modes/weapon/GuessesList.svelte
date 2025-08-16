<script lang="ts">
	import { CDN_URL } from '$lib/constants';
	import type { WeaponGuessResponse } from '$lib/dtos';
	import { ArrowBigDown, ArrowBigUp, MoveLeft, MoveRight } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	// The guesses the user has made
	export let guesses: WeaponGuessResponse[];
</script>

<div class="overflow-x-auto pb-2">
	<div class="grid gap-4 text-center min-w-[600px]">
		{#if guesses.length > 0}
			<div class="grid grid-cols-6 gap-2 items-center font-semibold" data-testId="guess-row-title">
				<p>Image</p>
				<p>Used By</p>
				<p>Slot</p>
				<p>Magazine size</p>
				<p>Release Year</p>
				<p>Qualities</p>
			</div>
		{/if}
		<div class="grid grid-cols-6 gap-2 items-center text-sm">
			{#each guesses as guess (guess.name)}
				{@const fadeDuration = 500}
				<div class="relative flex items-center justify-center w-full min-h-24">
					<div
						in:fade={{ duration: fadeDuration, delay: fadeDuration * 6 }}
						class="{guess.correct ? 'correct' : 'incorrect'} absolute inset-0 rounded-sm"
					/>
					<img
						in:fade={{ duration: fadeDuration }}
						src={`${CDN_URL}/weapons/thumbnails/${guess.name}.png`}
						alt={guess.name}
						class="w-20 relative z-10"
					/>
				</div>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 1 }}
					class={`p-2 min-h-24 rounded-sm flex items-center justify-center gap-2 ${guess.usedBy.status}`}
				>
					{guess.usedBy.value.join(', ')}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 2 }}
					class={`p-2 min-h-24 rounded-sm flex items-center justify-center gap-2 ${guess.slot.status}`}
				>
					{guess.slot.value.join(', ')}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 3 }}
					class={`p-2 min-h-24 rounded-sm flex items-center justify-center gap-2 ${guess.magazineSize.status}`}
				>
					{guess.magazineSize.value}
				</p>
				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 4 }}
					class={`p-2 min-h-24 rounded-sm flex items-center justify-center gap-2 ${guess.releaseDate.status}`}
				>
					{guess.releaseDate.value}
					<ArrowBigDown class={guess.releaseDate.status === 'earlier' ? '' : 'hidden'} />
					<ArrowBigUp class={guess.releaseDate.status === 'later' ? '' : 'hidden'} />
				</p>

				<p
					in:fade={{ duration: fadeDuration, delay: fadeDuration * 5 }}
					class={`p-2 min-h-24 rounded-sm flex items-center justify-center gap-2 ${guess.qualities.status}`}
				>
					{guess.qualities.value.join(', ')}
				</p>
			{/each}
		</div>
	</div>
</div>
<p
	class="scroll-guide flex items-center justify-center gap-2 text-center text-sm text-muted-foreground mt-2"
>
	<MoveLeft class="w-4" /> Scroll horizontally to see more <MoveRight class="w-4" />
</p>

<style scoped>
	.incorrect,
	.earlier,
	.later {
		background-color: hsl(var(--incorrect));
		color: hsl(var(--incorrect-foreground));
	}

	.partial {
		background-color: hsl(var(--partial));
		color: hsl(var(--partial-foreground));
	}

	.correct {
		background-color: hsl(var(--correct));
		color: hsl(var(--correct-foreground));
	}

	@media (min-width: 666px) {
		.scroll-guide {
			display: none;
		}
	}
</style>
