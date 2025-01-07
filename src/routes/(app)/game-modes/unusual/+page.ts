import type { CurrentUnusualDto, UnusualResponse } from '$lib/dtos';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	async function fetchTodaysUnusual() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/game-modes/unusual');
			data = (await res.json()) as CurrentUnusualDto;

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

	async function fetchUnusuals() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/unusuals');
			data = (await res.json()) as UnusualResponse[];

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
			const res = await fetch('/api/v1/game-modes/unusual/yesterday');
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
		todaysUnusual: await fetchTodaysUnusual(),
		unusuals: await fetchUnusuals(),
		yesterdaysAnswer: fetchYesterdaysAnswer()
	};
};
