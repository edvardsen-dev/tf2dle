import { get, writable, type Writable } from 'svelte/store';
import { useLocalStorage } from './useLocalStorage.ts';
import type { GuessResponse } from '#lib/dtos.ts';
import { onMount } from 'svelte';
import dayjs from '#lib/configs/dayjsConfig.ts';
import { toast } from 'svelte-sonner';
import { useStats } from './useStats.ts';

export function useGameEngine<T extends GuessResponse>(
	gamemode: string,
	fadingHints: number,
	numberOfCorrectGuesses: Writable<number | undefined>
) {
	const gameState = writable<'guessing' | 'won'>('guessing');
	const guesses = useLocalStorage<T[]>(`${gamemode}_guesses`, []);
	const lastEvent = useLocalStorage<{ event: String; date: string } | null>(
		`${gamemode}_last_event`,
		null
	);
	const streak = useLocalStorage(`${gamemode}_streak`, 0);
	const stats = useStats(gamemode);

	const validating = writable(false);
	const openVictoryDialog = writable(false);

	// Typo in weapon__streak. To make sure the streaks are not lost this needs to map to the new streak.
	// Should leave it like this for some time before it can be removed completed when most users have had their
	// streak converted to the correct key value pair in local storage
	// TODO: Remove around 16.07.24
	const oldWeaponStreak = useLocalStorage('weapon__streak', 0);
	// ---

	onMount(() => {
		// TODO: Remove around 16.07.24
		if (gamemode === 'weapon') {
			streak.set(get(oldWeaponStreak));
		}
		// ---
		initGameState();
	});

	/**
	 * Initializes game state based on last event
	 */
	function initGameState() {
		const _lastEvent = get(lastEvent);

		if (_lastEvent === null) {
			guesses.set([]);
			streak.set(0);
			// TODO: Remove around 16.07.24
			if (gamemode === 'weapon') {
				oldWeaponStreak.set(0);
			}
			// ---
			gameState.set('guessing');
		} else {
			// Reset streak if last victory was more than 1 days ago
			if (
				dayjs(_lastEvent.date).isBefore(dayjs.utc().subtract(1, 'day'), 'day') ||
				_lastEvent.event !== 'won'
			) {
				streak.set(0);
				// TODO: Remove around 16.07.24
				if (gamemode === 'weapon') {
					oldWeaponStreak.set(0);
				}
				// ---
			}

			switch (_lastEvent.event) {
				case 'won':
					if (dayjs.utc(_lastEvent.date).isSame(dayjs.utc(), 'date')) {
						gameState.set('won');
					} else {
						gameState.set('guessing');
						guesses.set([]);
					}
					break;
				case 'guessed':
					gameState.set('guessing');
					if (!dayjs.utc(_lastEvent.date).isSame(dayjs.utc(), 'date')) {
						guesses.set([]);
					}
					break;
			}
		}
	}

	/**
	 * Handles a guess
	 * @param guess name of the item guessed
	 */
	async function handleGuess(guess: string) {
		if (get(gameState) === 'won') return;

		const result = await checkGuess(guess);

		if (result) {
			guesses.update((guesses) => [result, ...guesses]);
			lastEvent.set({ event: result.correct ? 'won' : 'guessed', date: result.guessedAt });
		}

		if (result?.correct) {
			won();
		}

		return result;
	}

	/**
	 * Validate a guess
	 * @param guess to validate
	 */
	async function checkGuess(guess: string) {
		let data: T | null = null;
		let error = false;
		validating.set(true);

		try {
			const res = await fetch(`/api/v1/game-modes/${gamemode}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ guess, numberOfGuesses: get(guesses).length + 1 })
			});
			data = (await res.json()) as T;

			if (!res.ok) {
				error = true;
			}
		} catch (err) {
			error = true;
		} finally {
			validating.set(false);
		}

		if (error) {
			toast.error('Could not validate your guess, please try again!');
		} else {
			return data;
		}
	}

	/**
	 * Handles a victory
	 */
	function won() {
		setTimeout(() => {
			gameState.set('won');
			streak.update((streak) => streak + 1);
			// TODO: Remove around 16.07.24
			if (gamemode === 'weapon') {
				oldWeaponStreak.update((streak) => streak + 1);
			}
			// ---
			stats.incrementAttempt(get(guesses).length);
			const _numberOfCorrectGuesses = get(numberOfCorrectGuesses);
			numberOfCorrectGuesses.set(_numberOfCorrectGuesses ? _numberOfCorrectGuesses + 1 : 1);
			openVictoryDialog.set(true);
		}, 500 * fadingHints);
		// TODO: Change timeout delay based on gamemode
	}

	return {
		gameState,
		guesses,
		streak,
		stats,
		validating,
		openVictoryDialog,
		handleGuess
	};
}
