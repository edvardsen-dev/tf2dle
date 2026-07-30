import { describe, expect, test } from 'vitest';
import { buildShareText } from '$lib/share';
import type { WeaponGuessResponse } from '$lib/dtos';

describe('buildShareText', () => {
	test('builds text-only share text for non-weapon modes', () => {
		expect(
			buildShareText({
				mode: 'map',
				guesses: [{ correct: false }, { correct: false }, { correct: true }],
				streak: 1
			})
		).toBe(
			[
				'TF2DLE 🗺️ Map',
				"I beat today's challenge in 3 guesses. Can you beat me?",
				'https://tf2dle.com/game-modes/map'
			].join('\n')
		);
	});

	test('includes streaks above one', () => {
		expect(
			buildShareText({
				mode: 'unusual',
				guesses: [{ correct: true }],
				streak: 4
			})
		).toBe(
			[
				'TF2DLE ✨ Unusual',
				"I beat today's challenge in 1 guess. Can you beat me?",
				'🔥 4 day streak',
				'https://tf2dle.com/game-modes/unusual'
			].join('\n')
		);
	});

	test('builds a chronological weapon emoji grid', () => {
		const newestFirstGuesses: WeaponGuessResponse[] = [
			weaponGuess({
				correct: true,
				usedBy: 'correct',
				slot: 'correct',
				magazineSize: 'correct',
				releaseDate: 'correct',
				qualities: 'correct'
			}),
			weaponGuess({
				correct: false,
				usedBy: 'incorrect',
				slot: 'partial',
				magazineSize: 'incorrect',
				releaseDate: 'earlier',
				qualities: 'partial'
			})
		];

		expect(
			buildShareText({
				mode: 'weapon',
				guesses: newestFirstGuesses,
				streak: 3
			})
		).toBe(
			[
				'TF2DLE 🪓 Weapon',
				"I beat today's challenge in 2 guesses. Can you beat me?",
				'🟥🟥🟨🟥🟥🟨',
				'🟩🟩🟩🟩🟩🟩',
				'🔥 3 day streak',
				'https://tf2dle.com/game-modes/weapon'
			].join('\n')
		);
	});
});

function weaponGuess(statuses: {
	correct: boolean;
	usedBy: 'correct' | 'incorrect' | 'partial';
	slot: 'correct' | 'incorrect' | 'partial';
	magazineSize: 'correct' | 'incorrect';
	releaseDate: 'correct' | 'earlier' | 'later';
	qualities: 'correct' | 'incorrect' | 'partial';
}): WeaponGuessResponse {
	return {
		correct: statuses.correct,
		guessedAt: new Date().toISOString(),
		name: statuses.correct ? 'Scattergun' : 'Shortstop',
		numberOfCorrectGuesses: 1,
		releaseDate: {
			status: statuses.releaseDate,
			value: '2007'
		},
		usedBy: {
			status: statuses.usedBy,
			value: ['Scout']
		},
		slot: {
			status: statuses.slot,
			value: ['Primary']
		},
		magazineSize: {
			status: statuses.magazineSize,
			value: '6'
		},
		qualities: {
			status: statuses.qualities,
			value: ['Unique']
		}
	};
}
