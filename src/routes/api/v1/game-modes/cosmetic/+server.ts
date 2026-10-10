import dayjs from '#lib/configs/dayjsConfig.ts';
import { cosmeticService } from '#lib/server/services/CosmeticService.ts';
import MetricsService from '#lib/server/services/MetricsService.ts';

/**
 * Returns the current cosmetic with the number of
 * how many have already guessed it correctly
 * @returns HttpResponse
 */
export async function GET() {
	const currentTime = dayjs.utc();
	const todaysCosmetic = await cosmeticService.getCosmetic(currentTime);

	return Response.json({
		cosmetic: {
			thumbnail: todaysCosmetic.thumbnail,
			rotation: todaysCosmetic.rotation
		},
		numbersOfCorrectGuesses: todaysCosmetic.hasWon
	});
}

/**
 * Validates the cosmetic guess
 * @param param0 a RequestEvent containing a body with the guess
 * and what number of try it is
 * @returns CosmeticGuessResponse
 */
// @ts-ignore
export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	const result = await cosmeticService.validateGuess(guess, numberOfGuesses);
	await MetricsService.recordGameGuess('cosmetic', numberOfGuesses, result.correct);

	return Response.json(result);
}
