import dayjs from '$lib/configs/dayjsConfig';
import MetricsService from '$lib/server/services/MetricsService';
import { weaponTwoService } from '$lib/server/services/WeaponTwoService';
import { json } from '@sveltejs/kit';

/**
 * Returns number of correct guesses for todays weapon
 * @returns number of correct guesses
 */
export async function GET() {
	const currentTime = dayjs.utc();
	const todaysWeapon = await weaponTwoService.getWeaponByDay(currentTime);

	return json({
		weapon: {
			numberOfTotalAttributes: todaysWeapon.attributes.length - 1,
			attributes: [todaysWeapon.attributes[1]]
		},
		numberOfCorrectGuesses: todaysWeapon.hasWon
	});
}

export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	const result = await weaponTwoService.validateGuess(guess, numberOfGuesses);
	await MetricsService.recordGameGuess('weapon-2', numberOfGuesses, result.correct);

	return json(result);
}
