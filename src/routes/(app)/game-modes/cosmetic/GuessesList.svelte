<script lang="ts">
	import { CDN_URL } from '$lib/constants';
	import type { CosmeticGuessResponse } from '$lib/dtos';
	import { scale } from 'svelte/transition';

	// The guesses made by the user
	export let guesses: CosmeticGuessResponse[];
</script>

<div class="grid gap-2">
	{#each guesses as guess (guess.name)}
		<div
			in:scale={{ duration: 500, start: 0.5 }}
			class="flex items-center justify-center rounded-sm py-2 {guess.correct
				? 'bg-correct text-correct-foreground'
				: 'bg-incorrect text-incorrect-foreground'}"
		>
			<img src="{CDN_URL}/cosmetics/{guess.thumbnail}.png" alt={guess.name} />
			<p class="text-sm">{guess.name}</p>
		</div>
	{/each}
</div>
