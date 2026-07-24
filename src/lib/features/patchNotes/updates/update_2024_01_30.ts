import type { UpdateDate } from '../types';

export default {
	date: '2024-01-30',
	revisions: [
		{
			id: '2024-01-30.1',
			new: [
				{
					title: 'Added the Updates page.',
					gameModes: ['All modes']
				}
			],
			improved: [
				{
					title: 'Improved search so partial words are easier to find.',
					gameModes: ['All modes']
				},
				{
					title: 'Made feedback messages consistent across game modes.',
					gameModes: ['All modes']
				},
				{
					title: 'Made map images start less zoomed in.',
					gameModes: ['Map']
				}
			],
			fixed: [
				{
					title: 'Fixed games resetting more than once per day.',
					gameModes: ['All modes']
				}
			]
		}
	]
} satisfies UpdateDate;
