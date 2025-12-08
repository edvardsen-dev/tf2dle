export default {
	version: '0.2.0',
	date: '03.02.2024',
	newFeatures: [],
	improvements: [
		{
			title: 'Clear map hints',
			description:
				'As maps only have two hints (game mode and release year) some maps have the same hints, meaning the UI would tell you that you had everything correct when in fact it was the wrong map. Now, the image also has a colored border to indicate whether you have the correct map or not.',
			gameMode: 'Map',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	],
	bugFixes: [
		{
			title: 'Fix map cheat',
			description:
				'You can no longer drag the map image to see the full image when it is zoomed in.',
			gameMode: 'Map',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Typos in table headers',
			description: 'Fixed typos in table headers.',
			gameMode: 'Weapon',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Timer not resetting at midnight',
			description:
				'Timer would continue to count down after midnight with negative values. Should now reset as expected.',
			gameMode: 'All Game Modes',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		},
		{
			title: 'Challenge completion bug',
			description:
				"Previously, when first loading the page it would sometimes tell you that you had completed the challenge when you hand't. This should now be fixed.",
			gameMode: 'All Game Modes',
			author: {
				name: 'Joakim Edvardsen',
				link: 'https://github.com/jKm00'
			}
		}
	]
};
