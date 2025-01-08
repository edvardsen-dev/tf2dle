import { unusualService } from '$lib/server/services/UnusualService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const yesterdayAnswer = await unusualService.getYesterdaysAnswer();

	return json(yesterdayAnswer, { status: 200 });
}
