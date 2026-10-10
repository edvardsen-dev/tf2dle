<script lang="ts">
	import ShareResult from '#lib/components/games/ShareResult.svelte';
	import type { ShareMode } from '#lib/share.ts';

	interface Props {
		mode: ShareMode;
		challenge: string;
		guesses: unknown[];
		streak: number;
		correctGuesses: number | undefined;
	}
	let { mode, challenge, guesses, streak, correctGuesses }: Props = $props();

	let challengeLabel = $derived(challenge.toLowerCase());
	let guessLabel = $derived(guesses.length === 1 ? 'guess' : 'guesses');
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
