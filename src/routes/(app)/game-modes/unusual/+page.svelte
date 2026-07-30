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
	import { CDN_URL } from '$lib/constants';
	import CommunityStatus from '$lib/components/games/CommunityStatus.svelte';
	import CompletedResult from '$lib/components/games/CompletedResult.svelte';
	import YesterdayAnswer from '$lib/components/games/YesterdayAnswer.svelte';

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
	challenge="Unusual"
	shareMode="unusual"
	description="Guess today's unusual effect"
	img={{ basePath: `${CDN_URL}/unusuals/`, guessKey: 'thumbnail' }}
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
				framed={false}
			/>
		{/if}
		<Hints guesses={$guesses.length} series={$series} hasWon={$gameState === 'won'} />
		{#if $gameState === 'guessing'}
			<CommunityStatus challenge="unusual" correctGuesses={$numberOfCorrectGuesses} />
			<Input
				data={unusuals?.map((u) => ({
					img: `${CDN_URL}/unusuals/${u.thumbnail}.png`,
					value: u.name
				}))}
				guessed={$guesses.map((guess) => guess.name)}
				bind:validating={$validating}
				on:select={(e) => guess(e.detail)}
			/>
		{:else}
			<CompletedResult
				mode="unusual"
				challenge="unusual"
				guesses={$guesses}
				streak={$streak}
				correctGuesses={$numberOfCorrectGuesses}
			/>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
	<div slot="footer" class="flex justify-center w-full">
		{#await data.yesterdaysAnswer then yesterdaysAnswer}
			<YesterdayAnswer challenge="unusual" answer={yesterdaysAnswer} />
		{/await}
	</div>
</GameShell>
