import { browser } from '$app/env';
import { writable } from 'svelte/store';

/**
 * A store that automatically updates the local storage when the value of the store changes.
 * @param key to be used in the local storage
 * @param initValue a value used if the key is not found in the local storage
 * @returns a writable store
 */
export function useLocalStorage<T>(key: string, initValue: T) {
	const storedValue = browser ? localStorage.getItem(key) : null;
	const value = storedValue ? JSON.parse(storedValue) : initValue;

	const { subscribe, set, update } = writable<T>(value);

	subscribe((value) => {
		if (browser) {
			localStorage.setItem(key, JSON.stringify(value));
		}
	});

	return {
		subscribe,
		set,
		update
	};
}
