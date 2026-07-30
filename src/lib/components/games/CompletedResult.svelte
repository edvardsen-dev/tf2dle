<script lang="ts">
	import ShareResult from '$lib/components/games/ShareResult.svelte';
	import type { ShareMode } from '$lib/share';

	export let mode: ShareMode;
	export let challenge: string;
	export let guesses: unknown[];
	export let streak: number;
	export let correctGuesses: number | undefined;

	$: challengeLabel = challenge.toLowerCase();
	$: guessLabel = guesses.length === 1 ? 'guess' : 'guesses';
</script>

<div
	class="grid gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center shadow-sm shadow-primary/5"
	data-testId="completed-message"
>
	<div class="grid gap-1">
		<p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Daily complete</p>
		<p class="text-lg font-semibold text-foreground">Solved in {guesses.length} {guessLabel}</p>
		{#if correctGuesses !== undefined}
			<p class="text-sm text-muted-foreground">
				You are one of {correctGuesses}
				{correctGuesses === 1 ? 'gamer' : 'gamers'} who solved today's {challengeLabel}.
			</p>
		{/if}
	</div>
	<ShareResult {mode} {guesses} {streak} class="w-full" />
</div>
