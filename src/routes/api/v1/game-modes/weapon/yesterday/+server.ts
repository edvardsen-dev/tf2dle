import { weaponService } from '#lib/server/services/WeaponService.ts';

export async function GET() {
	const yesterdayAnswer = await weaponService.getYesterdaysAnswer();

	return Response.json(yesterdayAnswer, { status: 200 });
}
