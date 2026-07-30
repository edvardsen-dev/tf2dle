import type { WeaponGuessResponse } from '$lib/dtos';

export type ShareMode = 'weapon' | 'weapon-2' | 'map' | 'cosmetic' | 'unusual';

type ShareOptions = {
	mode: ShareMode;
	guesses: unknown[];
	streak: number;
};

const SITE_URL = 'https://tf2dle.com';

const modeLabels: Record<ShareMode, { label: string; emoji: string; slug: string }> = {
	weapon: { label: 'Weapon', emoji: '🪓', slug: 'weapon' },
	'weapon-2': { label: 'Weapon 2', emoji: '⚔️', slug: 'weapon-2' },
	map: { label: 'Map', emoji: '🗺️', slug: 'map' },
	cosmetic: { label: 'Cosmetic', emoji: '🎩', slug: 'cosmetic' },
	unusual: { label: 'Unusual', emoji: '✨', slug: 'unusual' }
};

export function buildShareText({ mode, guesses, streak }: ShareOptions) {
	const modeLabel = modeLabels[mode];
	const lines = [
		`TF2DLE ${modeLabel.emoji} ${modeLabel.label}`,
		`I beat today's challenge in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}. Can you beat me?`
	];

	if (mode === 'weapon') {
		const emojiGrid = buildWeaponEmojiGrid(guesses as WeaponGuessResponse[]);

		if (emojiGrid) {
			lines.push(emojiGrid);
		}
	}

	if (streak > 1) {
		lines.push(`🔥 ${streak} day streak`);
	}

	lines.push(`${SITE_URL}/game-modes/${modeLabel.slug}`);

	return lines.join('\n');
}

function buildWeaponEmojiGrid(guesses: WeaponGuessResponse[]) {
	return [...guesses]
		.reverse()
		.map((guess) =>
			[
				guess.correct ? '🟩' : '🟥',
				statusToEmoji(guess.usedBy.status),
				statusToEmoji(guess.slot.status),
				statusToEmoji(guess.magazineSize.status),
				statusToEmoji(guess.releaseDate.status),
				statusToEmoji(guess.qualities.status)
			].join('')
		)
		.join('\n');
}

function statusToEmoji(status: string) {
	if (status === 'correct') return '🟩';
	if (status === 'partial') return '🟨';

	return '🟥';
}
