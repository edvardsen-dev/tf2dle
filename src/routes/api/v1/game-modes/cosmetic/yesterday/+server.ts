import { cosmeticService } from '#lib/server/services/CosmeticService.ts';

export async function GET() {
	const yesterdaysAnswer = await cosmeticService.getYesterdaysAnswer();

	return Response.json(yesterdaysAnswer, { status: 200 });
}
