import type { MapDto, SelectedMapDto } from '$lib/dtos';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	/**
	 * Fetch todays map
	 */
	async function fetchTodaysMap() {
		let res;
		let data;
		let errorMessage: string | null = null;

		try {
			res = await fetch('/api/v1/game-modes/map');
			data = (await res.json()) as SelectedMapDto;

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
	 *  Fetch all maps
	 */
	async function fetchMaps() {
		try {
			const res = await fetch('/api/v1/maps');
			const data = (await res.json()) as MapDto[];

			return data;
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchYesterdaysAnswer() {
		let data;
		let errorMessage: string | null = null;

		try {
			const res = await fetch('/api/v1/game-modes/map/yesterday');
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
		todaysMap: fetchTodaysMap(),
		maps: fetchMaps(),
		yesterdaysAnswer: fetchYesterdaysAnswer()
	};
};
