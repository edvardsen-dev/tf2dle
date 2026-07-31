import type { UpdateDate } from '../types';

export default {
	date: '2026-07-31',
	revisions: [
		{
			id: '2026-07-31.1',
			new: [
				{
					title: 'Added shareable results.',
					description:
						'Solved results can now be copied for every game mode, with an emoji grid for Weapon.'
				},
				{
					title: 'Added game mode status to the landing page.',
					description:
						'The game mode cards now show when you have started or solved today’s challenge.'
				}
			],
			improved: [
				{
					title: 'Improved guess search and keyboard controls.',
					description:
						'The guess input now supports arrow-key navigation and clearer feedback for already guessed or missing results.'
				},
				{
					title: 'Improved feedback colors.',
					description: 'Correct, partial, and incorrect feedback colors now better fit the theme.'
				},
				{
					title: 'Improved Weapon guess table readability.',
					description:
						'Weapon guess rows now line up better when a result has many qualities, and the magazine header is shorter.'
				}
			],
			fixed: [
				{
					title: 'Fixed a few wording inconsistencies.',
					description:
						'Some labels and settings copy now use more consistent wording across the app.'
				}
			]
		}
	]
} satisfies UpdateDate;
