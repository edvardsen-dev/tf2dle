import type { UpdateDate } from '../types';

export default {
	date: '2024-10-06',
	revisions: [
		{
			id: '2024-10-06.1',
			new: [
				{
					title: 'Added the Weapon 2 game mode.',
					description: 'Guess daily weapons based on their in-game attributes.',
					href: '/game-modes/weapon-2',
					gameModes: ['Weapon 2'],
					credit: {
						type: 'suggestion',
						user: {
							name: 'becausewhybnot',
							link: 'https://www.reddit.com/user/becausewhybnot/'
						}
					}
				}
			]
		}
	]
} satisfies UpdateDate;
