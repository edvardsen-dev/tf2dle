import { unusualService } from '#lib/server/services/UnusualService.ts';

export async function GET() {
	const yesterdayAnswer = await unusualService.getYesterdaysAnswer();

	return Response.json(yesterdayAnswer, { status: 200 });
}
