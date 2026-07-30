<script lang="ts">
	import { Glasses, RefreshCcwDot, Sparkles } from 'lucide-svelte';

	export let guesses: number;
	export let series: string | null = null;
	export let hasWon = false;

	const ROTATION_HINT = 3;
	const GRAYSCALE_HINT = 6;
	const SERIES_HINT = 9;
</script>

<div class="grid gap-2 sm:grid-cols-3">
	<div
		class="rounded-lg border p-3 text-center text-xs {guesses >= ROTATION_HINT || hasWon
			? 'border-primary/30 bg-primary/10'
			: 'border-border/70 bg-muted/20 text-muted-foreground'}"
	>
		<RefreshCcwDot class="mx-auto mb-2 h-5 w-5" />
		<p class="font-medium text-foreground">Rotation</p>
		<p>
			{guesses >= ROTATION_HINT || hasWon
				? 'Correct rotation unlocked'
				: `Unlocks in ${ROTATION_HINT - guesses} guesses`}
		</p>
	</div>
	<div
		class="rounded-lg border p-3 text-center text-xs {guesses >= GRAYSCALE_HINT || hasWon
			? 'border-primary/30 bg-primary/10'
			: 'border-border/70 bg-muted/20 text-muted-foreground'}"
	>
		<Sparkles class="mx-auto mb-2 h-5 w-5" />
		<p class="font-medium text-foreground">Color</p>
		<p>
			{guesses >= GRAYSCALE_HINT || hasWon
				? 'Gray filter removed'
				: `Unlocks in ${GRAYSCALE_HINT - guesses} guesses`}
		</p>
	</div>
	<div
		class="rounded-lg border p-3 text-center text-xs {guesses >= SERIES_HINT || hasWon
			? 'border-primary/30 bg-primary/10'
			: 'border-border/70 bg-muted/20 text-muted-foreground'}"
	>
		<Glasses class="mx-auto mb-2 h-5 w-5" />
		<p class="font-medium text-foreground">Series clue</p>
		{#if guesses >= SERIES_HINT && series}
			<p><span class="font-semibold text-foreground">{series}</span></p>
		{:else if hasWon}
			<p>Solved before this clue</p>
		{:else}
			<p>Unlocks in {SERIES_HINT - guesses} guesses</p>
		{/if}
	</div>
</div>
