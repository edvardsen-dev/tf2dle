import { weaponTwoService } from '$lib/server/services/WeaponTwoService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const yesterdaysAnswer = await weaponTwoService.getYesterdaysAnswer();

	return json(yesterdaysAnswer, { status: 200 });
}
