import type { UpdateDate } from '../types';

export default {
	date: '2024-01-30',
	revisions: [
		{
			id: '2024-01-30.1',
			new: [
				{
					title: 'Added the Updates page.'
				}
			],
			improved: [
				{
					title: 'Improved search so partial words are easier to find.'
				},
				{
					title: 'Made feedback messages consistent across game modes.'
				},
				{
					title: 'Made map images start less zoomed in.',
					gameModes: ['Map']
				}
			],
			fixed: [
				{
					title: 'Fixed games resetting more than once per day.'
				}
			]
		}
	]
} satisfies UpdateDate;
