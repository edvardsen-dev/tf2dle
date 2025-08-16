<script lang="ts">
	import { CDN_URL } from '$lib/constants';
	import { scale } from 'svelte/transition';

	export let guesses: { name: string; correct: boolean }[];
</script>

<div class="grid gap-2 mt-2">
	{#each guesses as guess (guess.name)}
		<div
			in:scale={{ duration: 500, start: 0.5 }}
			class="flex items-center justify-center rounded-sm py-2 {guess.correct
				? 'bg-correct text-correct-foreground'
				: 'bg-incorrect text-incorrect-foreground'}"
		>
			<img
				src="{CDN_URL}/weapons/thumbnails/{guess.name}.png"
				alt={guess.name}
				class="size-10 object-contain"
			/>
			<p class="text-sm">{guess.name}</p>
		</div>
	{/each}
</div>
