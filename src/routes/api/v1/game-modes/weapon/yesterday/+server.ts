import { weaponService } from '$lib/server/services/WeaponService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const yesterdayAnswer = await weaponService.getYesterdaysAnswer();

	return json(yesterdayAnswer, { status: 200 });
}
