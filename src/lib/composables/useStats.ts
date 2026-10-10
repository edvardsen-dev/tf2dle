import { browser } from '$app/env';
import { get, writable } from 'svelte/store';

/**
 * A store that tracks the stats of the player locally
 * @param gamemode to track the stats of
 * @returns a store providing a subscribe function and a function
 * for incrementing the stats and one for clearing the stats
 */
export function useStats(gamemode: string) {
	const LOCAL_STORAGE_KEY = `${gamemode}_stats`;

	// Get init value
	const storedValue = browser && localStorage.getItem(LOCAL_STORAGE_KEY);
	const value = storedValue ? JSON.parse(storedValue) : [];

	const store = writable<number[]>(value);

	/**
	 * Increments the number of correct guesses with the number of attempts
	 * @param attempt it took the player to guess correct
	 */
	function incrementAttempt(attempt: number) {
		const currentStats = [...get(store)];

		if (currentStats[attempt - 1]) {
			currentStats[attempt - 1]++;
		} else {
			currentStats[attempt - 1] = 1;
		}

		store.set(currentStats);

		if (browser) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStats));
		}
	}

	/**
	 * Clears the stats
	 */
	function clearStats() {
		store.set([]);

		if (browser) {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		}
	}

	return {
		subscribe: store.subscribe,
		incrementAttempt,
		clearStats
	};
}

function getReturnType<R>(f: (...args: any[]) => R): { returnType: R } {
	return null!;
}

// dummy variable used to retrieve return type of `useStats`
const useStatsType = getReturnType(useStats);

export type UseStats = typeof useStatsType.returnType;
