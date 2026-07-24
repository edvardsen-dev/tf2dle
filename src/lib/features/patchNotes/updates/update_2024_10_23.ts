import type { UpdateDate } from '../types';

export default {
	date: '2024-10-23',
	revisions: [
		{
			id: '2024-10-23.1',
			improved: [
				{
					title: 'Show the map name after a correct map guess.',
					gameModes: ['Map']
				}
			],
			fixed: [
				{
					title: 'Made the color-blind mode toggle work with keyboard controls.'
				},
				{
					title: 'Fixed Weapon 2 stats not clearing from settings.',
					gameModes: ['Weapon 2']
				}
			]
		}
	]
} satisfies UpdateDate;
