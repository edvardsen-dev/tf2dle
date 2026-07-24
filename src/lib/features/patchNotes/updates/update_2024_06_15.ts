import type { UpdateDate } from '../types';

export default {
	date: '2024-06-15',
	revisions: [
		{
			id: '2024-06-15.1',
			new: [
				{
					title: 'Added quick commands.',
					description: 'Open them from the top-left button or with Ctrl/Cmd + K.',
					gameModes: ['All modes']
				}
			]
		}
	]
} satisfies UpdateDate;
