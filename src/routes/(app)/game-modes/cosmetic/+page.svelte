<script lang="ts">
	import Input from '$lib/components/games/Input.svelte';
	import * as Card from '$lib/components/ui/card';
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import dayjs from '$lib/configs/dayjsConfig.js';
	import type { CosmeticDto, CosmeticGuessResponse, CurrentCosmeticDto } from '$lib/dtos.js';
	import { AreaChart, Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Hints from './Hints.svelte';
	import GuessesList from './GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import { useStats } from '$lib/composables/useStats';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import CosmeticShowcase from '$lib/components/games/IconShowcase.svelte';
	import XmasDecore from '$lib/components/XmasDecore.svelte';

	export let data;

	const stats = useStats('cosmetic');
	let openStatsDialog = false;

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
	let openDialog = false;

	// Data
	let cosmetics: CosmeticDto[] = [];
	let todaysCosmetic: CurrentCosmeticDto | undefined;
	let numberOfCorrectGuesses: number;

	onMount(async () => {
		// Load data
		try {
			const [res1, res2] = await Promise.all([data.cosmetics, data.todaysCosmetic]);
			cosmetics = res1 ?? [];
			todaysCosmetic = res2;
			numberOfCorrectGuesses = res2?.numbersOfCorrectGuesses ?? 0;
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
			numberOfCorrectGuesses = numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1;
			gameState = 'won';
			openDialog = true;
		}, 500);
	}
</script>

<div class="grid gap-4">
	<Card.Root class="relative">
		<Card.Header>
			<div class="flex justify-between">
				<div>
					<Card.Title>Cosmetic</Card.Title>
					<Card.Description>Guess today's cosmetic</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center">
						<Dices aria-label="Number of guesses" />
						{$guesses.length}
					</p>
					<p class="flex items-center">
						<Flame aria-label="streak" />
						{$streak}
					</p>
					<button on:click={() => (openStatsDialog = true)}>
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<!-- TODO: Remove after xmas -->
			<XmasDecore />
			{#if loadingState === 'loading'}
				<div class="flex justify-center p-4">
					<Loader2 class="h-4 w-4 animate-spin" />
				</div>
			{:else if loadingState === 'error'}
				<a href="/game-modes/cosmetic" class="grid justify-items-center gap-4 p-4">
					Something went wrong. Please try to refresh.
					<RotateCw class="w-4 h-4" />
				</a>
			{:else}
				<div class="grid gap-8">
					{#if todaysCosmetic}
						<CosmeticShowcase
							gamemode="cosmetics"
							icon={todaysCosmetic?.cosmetic}
							guesses={$guesses.length}
							hasWon={gameState === 'won'}
						/>
					{/if}
					<Hints guesses={$guesses.length} usedBy={$usedBy} />
					{#if gameState === 'guessing'}
						<p class="text-sm text-center text-muted-foreground">
							{numberOfCorrectGuesses}
							{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays cosmetic
						</p>
						<Input
							data={cosmetics?.map((c) => ({
								img: `/images/cosmetics/${c.thumbnail}.png`,
								value: c.name
							}))}
							guessed={$guesses.map((guess) => guess.name)}
							{validating}
							on:select={(e) => handleSelect(e.detail)}
						/>
					{:else}
						<p class="text-sm text-center text-muted-foreground">
							You are 1 out of {numberOfCorrectGuesses} that have guessed todays cosmetic!
						</p>
					{/if}
					<GuessesList guesses={$guesses} />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#if $guesses.length > 0}
		<VictoryDialog
			bind:open={openDialog}
			img={{
				src: `/images/cosmetics/${todaysCosmetic?.cosmetic.thumbnail}.png`,
				alt: 'Todays cosmetic'
			}}
			imgSize="96px"
			challenge="Cosmetic"
			value={$guesses[0].name}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/unusual"
		/>
	{/if}
</div>
