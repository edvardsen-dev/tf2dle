import type { UpdateDate } from '../types';

export default {
	date: '2026-07-25',
	revisions: [
		{
			id: '2026-07-25.1',
			improved: [
				{
					title: 'Redesigned the settings dialog.',
					description:
						'Settings now use a roomier layout that separates preferences, notifications, and local data.'
				}
			]
		}
	]
} satisfies UpdateDate;
