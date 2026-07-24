import type { UpdateDate } from '../types';

export default {
	date: '2024-10-07',
	revisions: [
		{
			id: '2024-10-07.1',
			fixed: [
				{
					title: 'Added a proper error page for Weapon 2 failures.',
					gameModes: ['Weapon 2']
				}
			]
		}
	]
} satisfies UpdateDate;
