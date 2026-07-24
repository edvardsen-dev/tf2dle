import type { UpdateDate } from '../types';

export default {
	date: '2024-06-23',
	revisions: [
		{
			id: '2024-06-23.1',
			new: [
				{
					title: 'Added the Unusual Effects game mode.',
					description: 'Guess the unusual effect shown on screen.',
					href: '/game-modes/unusual',
					gameModes: ['Unusual']
				}
			]
		}
	]
} satisfies UpdateDate;
