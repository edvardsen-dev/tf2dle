import type { UpdateDate } from '../types';

export default {
	date: '2025-01-07',
	revisions: [
		{
			id: '2025-01-07.1',
			new: [
				{
					title: "Added yesterday's answer to each game mode.",
					gameModes: ['All modes'],
					credit: {
						type: 'suggestion',
						user: {
							name: 'Kalikq-p',
							link: 'https://www.reddit.com/user/Kalikq-p/'
						}
					}
				}
			]
		}
	]
} satisfies UpdateDate;
