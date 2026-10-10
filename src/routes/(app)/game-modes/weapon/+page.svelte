<script lang="ts">
	import Input from '#lib/components/games/Input.svelte';
	import { onMount } from 'svelte';
	import type { WeaponGuessResponse } from '#lib/dtos.ts';
	import GuessesList from './GuessesList.svelte';
	import { useGameEngine } from '#lib/composables/useGameEngine.ts';
	import { writable } from 'svelte/store';
	import GameShell from '#lib/components/games/GameShell.svelte';
	import { CDN_URL } from '#lib/constants.ts';
	import CommunityStatus from '#lib/components/games/CommunityStatus.svelte';
	import CompletedResult from '#lib/components/games/CompletedResult.svelte';
	import YesterdayAnswer from '#lib/components/games/YesterdayAnswer.svelte';
	import type { PageData } from './$types.js';

	// Data
	let { data }: { data: PageData } = $props();
	const numberOfCorrectGuesses = writable<number | undefined>(undefined);
	let weapons = $state.raw<string[]>([]);

	let loadingState = $state<'loading' | 'error' | 'success'>('loading');

	const { gameState, guesses, streak, stats, validating, openVictoryDialog, handleGuess } =
		useGameEngine<WeaponGuessResponse>('weapon', 7, numberOfCorrectGuesses);

	onMount(async () => {
		// Load data
		try {
			const [res1, res2] = await Promise.all([data.numberOfCorrectGuesses, data.weapons]);
			numberOfCorrectGuesses.set(res1 ?? 0);
			weapons = res2 ?? [];
		} catch (err) {
			loadingState = 'error';
			return;
		}

		loadingState = 'success';
	});
</script>

<GameShell
	title="Weapon"
	challenge="Weapon"
	shareMode="weapon"
	description="Guess today's weapon"
	img={{ basePath: `${CDN_URL}/weapons/thumbnails/`, guessKey: 'name' }}
	nextChallenge="/game-modes/weapon-2"
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if $gameState === 'guessing'}
			<CommunityStatus challenge="weapon" correctGuesses={$numberOfCorrectGuesses} />
			<Input
				data={weapons?.map((weapon) => ({
					img: `${CDN_URL}/weapons/thumbnails/${weapon}.png`,
					value: weapon
				}))}
				guessed={$guesses.map((guess) => guess.name)}
				onselect={handleGuess}
				validating={$validating}
			/>
		{:else}
			<CompletedResult
				mode="weapon"
				challenge="weapon"
				guesses={$guesses}
				streak={$streak}
				correctGuesses={$numberOfCorrectGuesses}
			/>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
	{#snippet footer()}
		<div class="flex justify-center w-full">
			{#await data.yesterdaysAnswer then yesterdaysAnswer}
				<YesterdayAnswer challenge="weapon" answer={yesterdaysAnswer} />
			{/await}
		</div>
	{/snippet}
</GameShell>
