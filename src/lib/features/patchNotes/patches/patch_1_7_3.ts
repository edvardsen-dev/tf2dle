export default {
	version: '1.7.3',
	date: '23.10.2024',
	newFeatures: [],
	improvements: [
		{
			title: 'Show map name',
			description:
				'Tne name of the map is now displayed under the image when correct map is selected.',
			gameMode: 'Map',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	],
	bugFixes: [
		{
			title: 'Color blind mode toggle',
			description:
				'Could only toggle color blind mode by clicking on the switch with mouse or touch. This should now also support keyboard navigation with the use of both space and enter key.',
			gameMode: 'Settings',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Clear weapon 2 stats',
			description:
				'Fixed a bug where weapon 2 stats were not being cleared when clearing from settings menu. This should now be fixed, and the stats should be cleared as expected.',
			gameMode: 'Weapon 2',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	]
};
