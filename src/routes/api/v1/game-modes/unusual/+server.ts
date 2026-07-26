import dayjs from '$lib/configs/dayjsConfig';
import MetricsService from '$lib/server/services/MetricsService';
import { unusualService } from '$lib/server/services/UnusualService';
import { json } from '@sveltejs/kit';

/**
 * Returns the current unusual with the number of
 * how many have already guessed it correctly
 * @return HttpResponse
 */
export async function GET() {
	const currentTime = dayjs.utc();
	const todaysUnusual = await unusualService.getUnusualByDay(currentTime);

	return json({
		unusual: {
			thumbnail: todaysUnusual.thumbnail,
			rotation: todaysUnusual.rotation
		},
		numberOfCorrectGuesses: todaysUnusual.hasWon
	});
}

// @ts-ignore
export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	const result = await unusualService.validateGuess(guess, numberOfGuesses);
	await MetricsService.recordGameGuess('unusual', numberOfGuesses, result.correct);

	return json(result);
}
