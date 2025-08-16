<script lang="ts">
	import Input from '$lib/components/games/Input.svelte';
	import { useLocalStorage } from '$lib/composables/useLocalStorage.js';
	import { useStats } from '$lib/composables/useStats.js';
	import dayjs from '$lib/configs/dayjsConfig.js';
	import type { WeaponTwoGuessResponse } from '$lib/dtos.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { AreaChart, Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import GuessesList from './GuessesList.svelte';
	import ColorExplanation from '$lib/components/games/ColorExplanation.svelte';
	import StatsDialog from '$lib/components/games/StatsDialog.svelte';
	import VictoryDialog from '$lib/components/games/VictoryDialog.svelte';
	import WinterDecore from '$lib/features/theme/components/winter/WinterDecore.svelte';
	import { CDN_URL } from '$lib/constants';

	export let data;

	const stats = useStats('weapon_2');
	let openStatsDialog = false;

	// State persisted in local storage
	let lastEvent = useLocalStorage<{ event: 'won' | 'guessed'; date: string } | null>(
		'weapon_2_last_event',
		null
	);
	let guesses = useLocalStorage<{ name: string; correct: boolean }[]>('weapon_2_guesses', []);
	let streak = useLocalStorage<number>('weapon_2_streak', 0);
	let clues = useLocalStorage<{ text: string; variant: 'positive' | 'negative' | 'neutral' }[]>(
		'weapon_2_clues',
		[]
	);
	let correctWeapon = useLocalStorage<string | null>('weapon_2_correct_weapon', null);

	// Current game state
	let gameState: 'guessing' | 'won' = 'guessing';
	let validating = false;
	let openVictoryDialog = false;

	let numberOfCorrectGuesses = 0;
	let numberOfTotalAttributes = 0;

	$: hiddenClues = numberOfTotalAttributes > 0 ? numberOfTotalAttributes - $clues.length : 0;

	onMount(async () => {
		const [todaysWeapon, weapons] = await Promise.all([data.todaysWeapon, data.weapons]);

		// Load data
		numberOfCorrectGuesses = todaysWeapon?.numberOfCorrectGuesses ?? 0;
		numberOfTotalAttributes = todaysWeapon?.weapon.numberOfTotalAttributes ?? 0;

		// Init game state
		if ($lastEvent === null) {
			guesses.set([]);
			clues.set(todaysWeapon?.weapon.attributes ?? []);
			correctWeapon.set(null);
			streak.set(0);
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
					clues.set(todaysWeapon?.weapon.attributes ?? []);
					correctWeapon.set(null);
					guesses.set([]);
				}
				break;
			case 'guessed':
				gameState = 'guessing';
				if (!dayjs.utc($lastEvent.date).isSame(dayjs.utc(), 'date')) {
					clues.set(todaysWeapon?.weapon.attributes ?? []);
					correctWeapon.set(null);
					guesses.set([]);
				}
				break;
		}
	});

	async function handleSelect(name: string) {
		if (gameState === 'won') return;

		// Validate guess
		const result = await checkGuess(name);

		if (result) {
			guesses.update((guesses) => [{ name, correct: result.correct }, ...guesses]);
			lastEvent.set({ event: result.correct ? 'won' : 'guessed', date: result.guessedAt });

			if (result.correct) {
				won(result);
			} else {
				clues.set(result.attributes);
			}
		}
	}

	async function checkGuess(name: string) {
		validating = true;
		let error = false;

		try {
			const res = await fetch('/api/v1/game-modes/weapon-2', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess: name, numberOfGuesses: $guesses.length + 1 })
			});
			const data = (await res.json()) as WeaponTwoGuessResponse;

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

	function won(answer: WeaponTwoGuessResponse) {
		setTimeout(() => {
			streak.update((streak) => streak + 1);
			stats.incrementAttempt($guesses.length);
			numberOfCorrectGuesses = numberOfCorrectGuesses ? numberOfCorrectGuesses + 1 : 1;
			clues.set(answer.attributes);
			correctWeapon.set(answer.name);
			gameState = 'won';
			openVictoryDialog = true;
		}, 500);
	}
</script>

<div class="grid gap-4">
	<Card.Root class="relative">
		<Card.Header>
			<div class="flex justify-between">
				<div>
					<Card.Title>Weapon 2</Card.Title>
					<Card.Description>Guess today's weapon based on its attributes</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center"><Dices aria-label="Number of guesses" />{$guesses.length}</p>
					<p class="flex items-center"><Flame aria-label="streak" /> {$streak}</p>
					<button on:click={() => (openStatsDialog = true)}>
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<WinterDecore />
			<div class="grid gap-4">
				{#await data.todaysWeapon}
					<div class="flex justify-center p-4">
						<Loader2 class="w-4 h-4 animate-spin" />
					</div>
				{:then todaysWeapon}
					{#if todaysWeapon}
						<div class="grid gap-4 text-sm justify-items-center mb-8">
							{#if $correctWeapon}
								<img
									src="{CDN_URL}/weapons/thumbnails/{$correctWeapon}.png"
									alt={$correctWeapon}
									class="size-20 object-contain border rounded-md"
								/>
								<h2 class="rounded-md text-lg py-2 px-4">
									{$correctWeapon}
								</h2>
							{:else}
								<div class="size-20 border rounded-md"></div>
								<h2
									class="rounded-md text-lg py-2 px-4 w-[150px] text-muted-foreground text-center"
								>
									???
								</h2>
							{/if}
							<div class="grid gap-1 text-center">
								{#each $clues as clue}
									{@const color =
										clue.variant === 'positive'
											? 'text-positive'
											: clue.variant === 'negative'
												? 'text-negative'
												: 'text-neutral'}
									<p class={color}>{clue.text}</p>
								{/each}
								{#each Array(hiddenClues) as _, index}
									<p class="bg-muted rounded-md text-muted-foreground text-sm py-1 px-2">
										Clue {$clues.length + index + 1}
									</p>
								{/each}
							</div>
						</div>
						{#await data.weapons then weapons}
							{#if gameState === 'guessing'}
								<p class="text-sm text-center text-muted-foreground mb-2">
									{numberOfCorrectGuesses}
									{numberOfCorrectGuesses === 1 ? 'gamer' : 'gamers'} have guessed todays weapon
								</p>
								<Input
									data={weapons?.map((weapon) => ({
										img: `${CDN_URL}/weapons/thumbnails/${weapon}.png`,
										value: weapon
									}))}
									guessed={$guesses.map((guess) => guess.name)}
									on:select={(e) => handleSelect(e.detail)}
									bind:validating
								/>
							{:else}
								<p class="text-sm text-center text-muted-foreground">
									You are 1 out of {numberOfCorrectGuesses} that have guessed todays weapon
								</p>
							{/if}
						{/await}
						<GuessesList guesses={$guesses} />
					{/if}
				{:catch error}
					<a
						data-sveltekit-reload
						href="/game-modes/weapon-2"
						class="grid justify-items-center gap-4 p-4"
						data-testId="refresh"
					>
						{error.body.message}
						<RotateCw class="w-4 h-4" />
					</a>
				{/await}
			</div>
		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground justify-center">
			{#await data.yesterdaysAnswer then yesterdaysAnswer}
				<p>Yesterday's weapon was: <span class="text-foreground">{yesterdaysAnswer}</span></p>
			{/await}
		</Card.Footer>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#await data.todaysWeapon then todaysWeapon}
		<VictoryDialog
			bind:open={openVictoryDialog}
			img={{
				src: `${CDN_URL}/weapons/thumbnails/${$correctWeapon}.png`,
				alt: $correctWeapon ?? ''
			}}
			imgSize="10rem"
			challenge="Weapon 2"
			value={$correctWeapon ?? ''}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={numberOfCorrectGuesses ?? 1}
			nextChallenge="/game-modes/map"
		/>
	{/await}
</div>
