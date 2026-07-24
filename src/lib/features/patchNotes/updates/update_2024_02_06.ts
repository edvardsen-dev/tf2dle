import type { UpdateDate } from '../types';

export default {
	date: '2024-02-06',
	revisions: [
		{
			id: '2024-02-06.1',
			new: [
				{
					title: 'Added navigation to the next game mode from the victory dialog.',
					gameModes: ['All modes']
				}
			],
			improved: [
				{
					title: 'Reordered weapon hints to be easier to follow.',
					gameModes: ['Weapon']
				},
				{
					title: 'Made cosmetic hints appear sooner.',
					gameModes: ['Cosmetic']
				}
			],
			fixed: [
				{
					title: 'Fixed the cosmetic gray filter on mobile.',
					gameModes: ['Cosmetic']
				},
				{
					title: 'Fixed streaks not resetting correctly after missed days.',
					gameModes: ['Weapon', 'Cosmetic']
				}
			]
		}
	]
} satisfies UpdateDate;
