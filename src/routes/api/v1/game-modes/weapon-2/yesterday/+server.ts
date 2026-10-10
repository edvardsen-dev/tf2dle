import { weaponTwoService } from '#lib/server/services/WeaponTwoService.ts';

export async function GET() {
	const yesterdaysAnswer = await weaponTwoService.getYesterdaysAnswer();

	return Response.json(yesterdaysAnswer, { status: 200 });
}
