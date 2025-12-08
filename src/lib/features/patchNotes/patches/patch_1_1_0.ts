export default {
	version: '1.1.0',
	date: '06.02.2024',
	newFeatures: [
		{
			title: 'Next game mode navigation',
			description: 'Can now navigate to the next game mode from the victory dialog.',
			gameMode: 'All Game Modes',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	],
	improvements: [
		{
			title: 'Re-orderd weapon hints',
			description: 'Weapon hints are now ordered in a more logical way.',
			gameMode: 'Weapon',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Made cosmetic easier',
			description:
				'The hints for the cosmetics are now given at 3, 6, and 9 tries instead of 5, 10, and 15.',
			gameMode: 'Cosmetic',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	],
	bugFixes: [
		{
			title: 'Fix grayfilter on mobile',
			description:
				'Grayfilter was not applied to cosmeitc on mobile devices. This should now be fixed.',
			gameMode: 'Cosmetic',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Fix streak reset',
			description: "Streak will now proparly reset if you don't guess correct within two days",
			gameMode: ['Weapon', 'Cosmetic'],
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	]
};
