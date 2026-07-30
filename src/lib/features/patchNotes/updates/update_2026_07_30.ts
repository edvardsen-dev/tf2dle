import type { UpdateDate } from '../types';

export default {
	date: '2026-07-30',
	revisions: [
		{
			id: '2026-07-30.1',
			new: [
				{
					title: 'Added shareable results for every game mode.',
					description:
						'Solved results can now be copied from the victory dialog or completed challenge view, with an emoji grid for Weapon.'
				}
			],
			improved: [
				{
					title: 'Refreshed completed challenge cards.',
					description:
						'Completed games now show a clearer result panel, share action, and quieter previous-answer note.'
				},
				{
					title: 'Improved map reveals and guess feedback colors.',
					description:
						'Solved maps now show the answer on the image, and feedback colors better match TF2 item qualities.'
				}
			]
		}
	]
} satisfies UpdateDate;
