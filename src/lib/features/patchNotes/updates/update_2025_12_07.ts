import type { UpdateDate } from '../types';

export default {
	date: '2025-12-07',
	revisions: [
		{
			id: '2025-12-07.1',
			improved: [
				{
					title: 'Added a custom 404 page for missing pages.',
					credit: {
						type: 'contribution',
						user: {
							name: 'Rodak123',
							link: 'https://github.com/Rodak123'
						}
					}
				}
			]
		}
	]
} satisfies UpdateDate;
