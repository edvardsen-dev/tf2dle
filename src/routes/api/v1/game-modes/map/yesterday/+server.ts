import { mapService } from '#lib/server/services/MapService.ts';

export async function GET() {
	const yesterdayAnswer = await mapService.getYesterdaysAnswer();

	return Response.json(yesterdayAnswer, { status: 200 });
}
