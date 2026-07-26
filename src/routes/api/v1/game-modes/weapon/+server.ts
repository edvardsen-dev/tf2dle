import { weaponService } from '$lib/server/services/WeaponService';
import MetricsService from '$lib/server/services/MetricsService';
import { json } from '@sveltejs/kit';

/**
 * Returns info of todays weapon
 * @returns todays weapon
 */
export async function GET() {
	const numberOfCorrectGuesses = await weaponService.getNumberOfCorrectGuesses();

	return json(numberOfCorrectGuesses, { status: 200 });
}

/**
 * Checks if the name of the weapon given is todays weapon
 * @param request a request object with a body containing
 * the name of the weapon to validate in the field 'guess' ({ guess: string})
 * @returns WeaponGuessResponse
 */
export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	try {
		const result = await weaponService.validateGuess(guess);
		await MetricsService.recordGameGuess('weapon', numberOfGuesses, result.correct);

		return json(result, { status: 200 });
	} catch (err) {
		return json('Could not find weapon with name ' + guess, { status: 404 });
	}
}
