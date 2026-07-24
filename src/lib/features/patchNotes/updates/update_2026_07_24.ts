import type { UpdateDate } from '../types';

export default {
	date: '2026-07-24',
	revisions: [
		{
			id: '2026-07-24.1',
			new: [
				{
					title: 'Redesigned patch notes as Updates.',
					description:
						'Updates are now grouped by month and date, with only player-facing changes shown.',
					href: '/patch-notes'
				},
				{
					title: 'Added footer version and data freshness.',
					description:
						'The footer now shows the current app version and when the game data was last updated.'
				},
				{
					title: 'Added update notification settings.',
					description: 'You can now mute the unread Updates indicator from settings.'
				},
				{
					title: 'Added a setting to hide the reset timer.',
					description: 'Enable it from settings if the footer timer is distracting.',
					credit: {
						type: 'suggestion',
						user: {
							name: 'AlkyyTheBest',
							link: 'https://www.reddit.com/user/AlkyyTheBest/'
						}
					}
				}
			],
			improved: [
				{
					title: 'Made the footer better suited for its expanded content.',
					description:
						'Footer links and metadata are now more subtle while keeping the reset timer easy to find.'
				}
			]
		}
	]
} satisfies UpdateDate;
