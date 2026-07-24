import type { UpdateDate } from '../types';

export default {
	date: '2024-02-05',
	revisions: [
		{
			id: '2024-02-05.1',
			new: [
				{
					title: 'Added the Cosmetic game mode.',
					gameModes: ['Cosmetic']
				}
			],
			improved: [
				{
					title: 'Improved mobile support for the Weapon game mode.',
					gameModes: ['Weapon']
				}
			]
		}
	]
} satisfies UpdateDate;
