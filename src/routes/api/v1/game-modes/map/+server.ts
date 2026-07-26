import { mapService } from '$lib/server/services/MapService.js';
import MetricsService from '$lib/server/services/MetricsService';
import { json } from '@sveltejs/kit';

/**
 * Returns the info of todays map
 */
export async function GET() {
	const map = await mapService.getTodaysMap();

	return json({
		image: {
			url: map?.image,
			startingPos: {
				x: map?.startingPos.x,
				y: map?.startingPos.y
			}
		},
		correctGuesses: map.hasWon
	});
}

/**
 * Checks if the name of the map given is todays map
 * @param request a request object with a body containing
 * the name of the map to check in the field 'guess' ({ guess: string})
 * @returns MapGuessResponse
 */
export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	const result = await mapService.validateGuess(guess);
	await MetricsService.recordGameGuess('map', numberOfGuesses, result.correct);

	return json(result);
}
