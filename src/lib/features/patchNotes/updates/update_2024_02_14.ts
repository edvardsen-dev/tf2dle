import type { UpdateDate } from '../types';

export default {
	date: '2024-02-14',
	revisions: [
		{
			id: '2024-02-14.1',
			fixed: [
				{
					title: 'Fixed guesses made around midnight being saved to the wrong daily puzzle.',
					gameModes: ['All modes']
				},
				{
					title:
						'Revealed the cosmetic image after a correct guess even before color hints unlock.',
					gameModes: ['Cosmetic']
				}
			]
		}
	]
} satisfies UpdateDate;
