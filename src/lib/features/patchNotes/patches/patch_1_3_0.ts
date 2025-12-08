export default {
	version: '1.3.0',
	date: '14.02.2024',
	newFeatures: [],
	improvements: [],
	bugFixes: [
		{
			title: 'Timing bug',
			description:
				'If you guessed correct some seconds before midnight, the server would validate it to correct, and if by the time it reached the client, a new day had started, it would be marked as if you had guessed the new days puzzle. This has been fixed and should no longer be an issue',
			gameMode: 'All Game Modes',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Cosmetic color show when correct',
			description:
				"Previously, the gray filter of the cosmetic would still be applied when you guessed correct cosmetic prior to the color hint. This has been fixed and the gray filter will now be removed whenever you guess the correct cosmetic, regardless if it's prior to the color hint or not.",
			gameMode: 'Cosmetics',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	]
};
