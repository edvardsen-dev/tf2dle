import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	/**
	 * Fetches the number of how many have already guessed todays weapon
	 */
	async function fetchNumberOfCorrectGuesses() {
		let res;
		let data;
		let errorMessage: string | null = null;

		try {
			res = await fetch('/api/v1/game-modes/weapon');
			data = (await res.json()) as number;

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

	/**
	 * Fetches all weapons
	 */
	async function fetchWeapons() {
		let res;
		let data;
		let errorMessage: string | null = null;

		try {
			res = await fetch('/api/v1/weapons');
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
			const res = await fetch('/api/v1/game-modes/weapon/yesterday');
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
		weapons: fetchWeapons(),
		numberOfCorrectGuesses: fetchNumberOfCorrectGuesses(),
		yesterdaysAnswer: fetchYesterdaysAnswer()
	};
};
