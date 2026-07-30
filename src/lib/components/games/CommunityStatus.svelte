<script lang="ts">
	export let challenge: string;
	export let correctGuesses: number | undefined;

	$: challengeLabel = challenge.toLowerCase();
</script>

{#if correctGuesses !== undefined}
	<div
		class="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground"
		data-testId="number-of-correct-guesses"
	>
		<span class="font-medium text-foreground">{correctGuesses}</span>
		{correctGuesses === 1 ? 'gamer has' : 'gamers have'} solved today's {challengeLabel}.
	</div>
{/if}
