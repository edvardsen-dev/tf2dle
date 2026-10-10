import dayjs from '#lib/configs/dayjsConfig.ts';
import MetricsService from '#lib/server/services/MetricsService.ts';
import { unusualService } from '#lib/server/services/UnusualService.ts';

/**
 * Returns the current unusual with the number of
 * how many have already guessed it correctly
 * @return HttpResponse
 */
export async function GET() {
	const currentTime = dayjs.utc();
	const todaysUnusual = await unusualService.getUnusualByDay(currentTime);

	return Response.json({
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

	return Response.json(result);
}
