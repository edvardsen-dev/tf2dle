import type { UpdateDate } from '../types';

export default {
	date: '2024-02-11',
	revisions: [
		{
			id: '2024-02-11.1',
			new: [
				{
					title: 'Added color-blind mode.',
					description:
						'Enable it from settings to make correct, partial, and incorrect feedback easier to distinguish.'
				}
			],
			fixed: [
				{
					title: 'Fixed shared posts using the wrong site URL.'
				}
			]
		}
	]
} satisfies UpdateDate;
