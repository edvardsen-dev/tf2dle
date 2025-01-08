<script lang="ts">
	import GameShell from '$lib/components/games/GameShell.svelte';
	import Input from '$lib/components/games/Input.svelte';
	import { useGameEngine } from '$lib/composables/useGameEngine';
	import type { UnusualGuessResponse } from '$lib/dtos.js';
	import { writable } from 'svelte/store';
	import Hints from './Hints.svelte';
	import IconShowcase from '$lib/components/games/IconShowcase.svelte';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import GuessesList from './GuessesList.svelte';

	export let data;

	$: ({ todaysUnusual, unusuals } = data);

	let series = useLocalStorage<string | null>('unusual_series', null);

	let numberOfCorrectGuesses = writable<number>(0);

	let loadingState: 'loading' | 'error' | 'success' = 'loading';

	$: if (todaysUnusual) {
		numberOfCorrectGuesses.set(todaysUnusual.numberOfCorrectGuesses);
		loadingState = 'success';
	}

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<UnusualGuessResponse>('unusual', 2, numberOfCorrectGuesses);

	async function guess(value: string) {
		const result = await handleGuess(value);

		if (result && result.series) {
			series.set(result.series);
		}
	}
</script>

<GameShell
	title="Unusuals"
	description="Guess today's unusual effect"
	img={{ basePath: '/images/unusuals/', guessKey: 'thumbnail' }}
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if todaysUnusual}
			<IconShowcase
				gamemode="unusuals"
				icon={todaysUnusual.unusual}
				guesses={$guesses.length}
				hasWon={$gameState === 'won'}
				size={{ width: 200, height: 200 }}
			/>
		{/if}
		<Hints guesses={$guesses.length} series={$series} />
		{#if $gameState === 'guessing'}
			<p class="text-sm text-center text-muted-foreground">
				{$numberOfCorrectGuesses}
				{$numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays unusual
			</p>
			<Input
				data={unusuals?.map((u) => ({
					img: `/images/unusuals/${u.thumbnail}.png`,
					value: u.name
				}))}
				guessed={$guesses.map((guess) => guess.name)}
				bind:validating={$validating}
				on:select={(e) => guess(e.detail)}
			/>
		{:else}
			<p class="text-sm text-center text-muted-foreground">
				You are 1 out of {$numberOfCorrectGuesses} that have guessed todays unusual
			</p>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
	<div slot="footer" class="flex justify-center w-full">
		{#await data.yesterdaysAnswer then yesterdaysAnswer}
			<p>Yesterday's unusual was: <span class="text-foreground">{yesterdaysAnswer}</span></p>
		{/await}
	</div>
</GameShell>
