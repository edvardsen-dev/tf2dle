import type { UpdateDate } from '../types';

export default {
	date: '2024-02-03',
	revisions: [
		{
			id: '2024-02-03.1',
			improved: [
				{
					title: 'Added map image feedback so duplicate hints are easier to understand.',
					gameModes: ['Map']
				}
			],
			fixed: [
				{
					title: 'Prevented zoomed map images from being dragged to reveal the answer.',
					gameModes: ['Map']
				},
				{
					title: 'Fixed the reset timer continuing past midnight.',
					gameModes: ['All modes']
				},
				{
					title: 'Fixed completed challenges sometimes being shown before playing.',
					gameModes: ['All modes']
				}
			]
		}
	]
} satisfies UpdateDate;
