<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/games/Input.svelte';
	import ImageShowcase from './ImageShowcase.svelte';
	import dayjs from '$lib/configs/dayjsConfig';
	import type { MapGuessResponse } from '$lib/dtos.js';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import GuessesList from './GuessesList.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import { AreaChart, Dices, Flame, RotateCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { useStats } from '$lib/composables/useStats';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import XmasDecore from '$lib/components/XmasDecore.svelte';

	export let data;

	$: ({ todaysMap } = data);

	const stats = useStats('map');
	let openStatsDialog = false;

	// State persisted in local storage
	let gameState: 'guessing' | 'won' = 'guessing';
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'map_last_event',
		null
	);
	let guesses = useLocalStorage<MapGuessResponse[]>('map_guesses', []);
	let streak = useLocalStorage<number>('map_streak', 0);
	let todaysMapName = useLocalStorage<string>('map_todays_map_name', '');

	// Current game state
	let validating = false;
	let openDialog = false;

	let numberOfCorrectGuesses: number | undefined = undefined;

	onMount(async () => {
		// Load data
		numberOfCorrectGuesses = (await todaysMap)?.correctGuesses ?? 0;

		// Init game state
		if ($lastEvent === null) {
			guesses.set([]);
			streak.set(0);
			todaysMapName.set('');
			gameState = 'guessing';
			return;
		}

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
					todaysMapName.set('');
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if (!dayjs.utc($lastEvent.date).isSame(dayjs.utc(), 'date')) {
					guesses.set([]);
					todaysMapName.set('');
				}
				break;
		}
	});

	/**
	 * Handle a user's guess
	 * @param name of the map
	 */
	async function handleSelect(name: string) {
		if (gameState === 'won') return;

		// Validate guess
		const result = await checkGuess(name);

		if (result) {
			// Update guesses list
			guesses.update((guesses) => [result, ...guesses]);
			// Update last event
			lastEvent.set({ event: result.correct ? 'won' : 'guessed', date: result.guessedAt });

			if (result.correct) {
				won(result.name.value);
			}
		}
	}

	/**
	 * Validate a guess
	 * @param value to validate
	 */
	async function checkGuess(value: string) {
		validating = true;
		let error = false;

		try {
			const res = await fetch('/api/v1/game-modes/map', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess: value })
			});
			const data = (await res.json()) as MapGuessResponse;

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
	 * Handle a user's victory
	 * @param mapName of the correct map
	 */
	function won(mapName: string) {
		// Wait for reveal animation to finish
		setTimeout(() => {
			streak.update((streak) => streak + 1);
			todaysMapName.set(mapName);
			stats.incrementAttempt($guesses.length);
			numberOfCorrectGuesses = numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1;
			gameState = 'won';
			openDialog = true;
		}, 2000);
	}
</script>

<div class="grid gap-4">
	<Card.Root class="relative">
		<Card.Header>
			<div class="flex justify-between">
				<div>
					<Card.Title>Map</Card.Title>
					<Card.Description>Guess today's map</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center">
						<Dices aria-label="Number of guesses" />
						{$guesses.length}
					</p>
					<p class="flex items-center"><Flame aria-label="streak" /> {$streak}</p>
					<button on:click={() => (openStatsDialog = true)}>
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<!-- TODO: Remove after xmas -->
			<XmasDecore />
			<div class="grid gap-4">
				{#await data.todaysMap}
					<div class="aspect-video bg-muted animate-pulse"></div>
				{:then todaysMap}
					{#if todaysMap}
						<ImageShowcase
							url={`/images/maps/originals/${todaysMap.image.url}.png`}
							startingPos={todaysMap.image.startingPos}
							numberOfGuesses={$guesses.length}
							hasWon={gameState === 'won'}
							mapName={$todaysMapName}
						/>
						{#await data.maps then maps}
							{#if gameState === 'guessing'}
								{#if numberOfCorrectGuesses !== undefined}
									<p class="text-center text-sm text-muted-foreground">
										{numberOfCorrectGuesses}
										{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} has guessed todays map
									</p>
								{/if}
								<Input
									on:select={(event) => handleSelect(event.detail)}
									data={maps?.map((map) => ({
										img: `/images/maps/thumbnails/${map.thumbnail}.png`,
										value: map.name
									}))}
									guessed={$guesses.map((guess) => guess.name.value)}
									bind:validating
								/>
							{:else if numberOfCorrectGuesses !== undefined}
								<p class="text-center text-sm text-muted-foreground">
									You are 1 out of {numberOfCorrectGuesses} that have guessed todays map!
								</p>
							{/if}
						{/await}
						<GuessesList guesses={$guesses} />
					{/if}
				{:catch error}
					<a
						data-sveltekit-reload
						href="/game-modes/map"
						class="grid justify-items-center gap-4 p-4"
						data-testId="refresh"
					>
						{error.body.message}
						<RotateCw class="w-4 h-4" />
					</a>
				{/await}
			</div>
		</Card.Content>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#await data.todaysMap then todaysMap}
		<VictoryDialog
			bind:open={openDialog}
			img={{
				src: `/images/maps/originals/${todaysMap?.image.url}.png`,
				alt: $todaysMapName
			}}
			challenge="Map"
			value={$todaysMapName}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/cosmetic"
		/>
	{/await}
</div>
