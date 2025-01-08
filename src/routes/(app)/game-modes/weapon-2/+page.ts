import type { WeaponTwoResponse } from '$lib/dtos';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	async function fetchTodaysWeapon() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/game-modes/weapon-2');
			data = (await res.json()) as WeaponTwoResponse;

			if (!res.ok) {
				errorMessage = 'Something went wrong. Please refresh the page.';
			}
		} catch (err) {
			errorMessage = 'Something went wrong. Please refresh the page.';
		}

		if (errorMessage) {
			error(500, errorMessage);
		}

		return data;
	}

	async function fetchWeapons() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/weapons');
			data = (await res.json()) as string[];

			if (!res.ok) {
				errorMessage = 'Something went wrong. Please refresh the page.';
			}
		} catch (err) {
			errorMessage = 'Something went wrong. Please refresh the page.';
		}

		if (errorMessage) {
			error(500, errorMessage);
		}

		return data;
	}

	async function fetchYesterdaysAnswer() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/game-modes/weapon-2/yesterday');
			data = (await res.json()) as string;

			if (!res.ok) {
				errorMessage = 'Something went wrong. Please refresh the page.';
			}
		} catch (err) {
			errorMessage = 'Something went wrong. Please refresh the page.';
		}

		if (errorMessage) {
			error(500, errorMessage);
		}

		return data;
	}

	return {
		todaysWeapon: fetchTodaysWeapon(),
		weapons: fetchWeapons(),
		yesterdaysAnswer: fetchYesterdaysAnswer()
	};
};
