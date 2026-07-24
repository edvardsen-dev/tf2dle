import { writable } from 'svelte/store';
import { useLocalStorage } from '$lib/composables/useLocalStorage';

export const openSettings = writable(false);
export const hideResetTimer = useLocalStorage('hide_reset_timer', false);
