import type { UpdateDate } from '../types';

export default {
	date: '2024-10-18',
	revisions: [
		{
			id: '2024-10-18.1',
			improved: [
				{
					title: 'Improved daily answer selection so repeats are less frequent.',
					gameModes: ['All modes']
				}
			],
			fixed: [
				{
					title: 'Hid item names from Weapon 2 hints.',
					gameModes: ['Weapon 2'],
					credit: {
						type: 'report',
						user: {
							name: 'VaniRabbit',
							link: 'https://www.reddit.com/user/VaniRabbit/'
						}
					}
				}
			]
		}
	]
} satisfies UpdateDate;
