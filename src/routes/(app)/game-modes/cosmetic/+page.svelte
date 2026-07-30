<script lang="ts">
	import CompletedResult from '$lib/components/games/CompletedResult.svelte';
	import CommunityStatus from '$lib/components/games/CommunityStatus.svelte';
	import GameShell from '$lib/components/games/GameShell.svelte';
	import Input from '$lib/components/games/Input.svelte';
	import CosmeticShowcase from '$lib/components/games/IconShowcase.svelte';
	import YesterdayAnswer from '$lib/components/games/YesterdayAnswer.svelte';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { useStats } from '$lib/composables/useStats';
	import { CDN_URL } from '$lib/constants';
	import dayjs from '$lib/configs/dayjsConfig.js';
	import type { CosmeticDto, CosmeticGuessResponse, CurrentCosmeticDto } from '$lib/dtos.js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import GuessesList from './GuessesList.svelte';
	import Hints from './Hints.svelte';

	export let data;

	const stats = useStats('cosmetic');

	// State persisted in local storage
	let guesses = useLocalStorage<CosmeticGuessResponse[]>('cosmetic_guesses', []);
	let lastEvent = useLocalStorage<{ event: string; date: string } | null>(
		'cosmetic_last_event',
		null
	);
	let streak = useLocalStorage('cosmetic_streak', 0);
	let usedBy = useLocalStorage<string | null>('cosmetic_used_by', null);

	// Current game state
	let loadingState: 'loading' | 'error' | 'success' = 'loading';
	let gameState: 'guessing' | 'won' = 'guessing';
	let validating = false;
	let openVictoryDialog = writable(false);

	// Data
	let cosmetics: CosmeticDto[] = [];
	let todaysCosmetic: CurrentCosmeticDto | undefined;
	let numberOfCorrectGuesses = writable<number | undefined>(undefined);

	onMount(async () => {
		// Load data
		try {
			const [res1, res2] = await Promise.all([data.cosmetics, data.todaysCosmetic]);
			cosmetics = res1 ?? [];
			todaysCosmetic = res2;
			numberOfCorrectGuesses.set(res2?.numbersOfCorrectGuesses ?? 0);
		} catch (err) {
			loadingState = 'error';
			return;
		}

		// Init game state
		if ($lastEvent === null) {
			guesses.set([]);
			streak.set(0);
			usedBy.set(null);
			gameState = 'guessing';
		} else {
			// Reset streak if last victory was more than 1 days ago
			if (
				dayjs($lastEvent.date).isBefore(dayjs.utc().subtract(1, 'day'), 'day') ||
				$lastEvent.event !== 'won'
			) {
				streak.set(0);
			}

			switch ($lastEvent.event) {
				case 'won':
					if (dayjs.utc($lastEvent.date).isSame(dayjs.utc(), 'date')) {
						gameState = 'won';
					} else {
						gameState = 'guessing';
						guesses.set([]);
						usedBy.set(null);
					}
					break;
				case 'guessed':
					gameState = 'guessing';
					if (!dayjs.utc($lastEvent.date).isSame(dayjs.utc(), 'date')) {
						guesses.set([]);
						usedBy.set(null);
					}
					break;
			}
		}

		loadingState = 'success';
	});

	/**
	 * Handle a guess
	 * @param name of the cosmetic guessed
	 */
	async function handleSelect(name: string) {
		if (gameState === 'won') return;

		// Validate guess
		const result = await checkGuess(name);

		// Update game state based on result
		if (result) {
			guesses.update((guesses) => [result, ...guesses]);
			// Update last event
			lastEvent.set({ event: result.correct ? 'won' : 'guessed', date: result.guessedAt });
			if (result.usedBy) {
				usedBy.set(result.usedBy);
			}
			if (result.correct) {
				won();
			}
		}
	}

	/**
	 * Validate a guess
	 * @param guess to validate
	 */
	async function checkGuess(guess: string) {
		validating = true;
		let error = false;

		try {
			const res = await fetch('/api/v1/game-modes/cosmetic', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					guess,
					numberOfGuesses: $guesses.length + 1
				})
			});
			const data = (await res.json()) as CosmeticGuessResponse;

			if (!res.ok) {
				error = true;
			} else {
				return data;
			}
		} catch (err) {
			error = true;
		} finally {
			validating = false;
		}

		if (error) {
			toast.error('Could not validate your guess, please try again.');
		}
	}

	/**
	 * Update game state when a user has won
	 */
	function won() {
		setTimeout(() => {
			streak.update((streak) => streak + 1);
			stats.incrementAttempt($guesses.length);
			numberOfCorrectGuesses.update((numberOfCorrectGuesses) =>
				numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1
			);
			gameState = 'won';
			openVictoryDialog.set(true);
		}, 500);
	}
</script>

<GameShell
	title="Cosmetic"
	challenge="Cosmetic"
	shareMode="cosmetic"
	description="Guess today's cosmetic"
	img={{ basePath: `${CDN_URL}/cosmetics/`, guessKey: 'thumbnail' }}
	nextChallenge="/game-modes/unusual"
	{loadingState}
	{guesses}
	{streak}
	{stats}
	{numberOfCorrectGuesses}
	{openVictoryDialog}
>
	<div class="grid gap-4">
		{#if todaysCosmetic}
			<CosmeticShowcase
				gamemode="cosmetics"
				icon={todaysCosmetic?.cosmetic}
				guesses={$guesses.length}
				hasWon={gameState === 'won'}
			/>
		{/if}
		<Hints guesses={$guesses.length} usedBy={$usedBy} hasWon={gameState === 'won'} />
		{#if gameState === 'guessing'}
			<CommunityStatus challenge="cosmetic" correctGuesses={$numberOfCorrectGuesses} />
			<Input
				data={cosmetics?.map((c) => ({
					img: `${CDN_URL}/cosmetics/${c.thumbnail}.png`,
					value: c.name
				}))}
				guessed={$guesses.map((guess) => guess.name)}
				bind:validating
				on:select={(e) => handleSelect(e.detail)}
			/>
		{:else}
			<CompletedResult
				mode="cosmetic"
				challenge="cosmetic"
				guesses={$guesses}
				streak={$streak}
				correctGuesses={$numberOfCorrectGuesses}
			/>
		{/if}
		<GuessesList guesses={$guesses} />
	</div>
	<div slot="footer" class="flex justify-center w-full">
		{#await data.yesterdaysAnswer then yesterdaysAnswer}
			<YesterdayAnswer challenge="cosmetic" answer={yesterdaysAnswer} />
		{/await}
	</div>
</GameShell>
