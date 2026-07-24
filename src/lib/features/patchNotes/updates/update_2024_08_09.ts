import type { UpdateDate } from '../types';

export default {
	date: '2024-08-09',
	revisions: [
		{
			id: '2024-08-09.1',
			improved: [
				{
					title: 'Added answer color behind weapon icons so identical hints are easier to resolve.',
					gameModes: ['Weapon'],
					credit: {
						type: 'report',
						user: {
							name: 'Klush',
							link: 'https://www.reddit.com/user/_Klush_/'
						}
					}
				}
			]
		}
	]
} satisfies UpdateDate;
