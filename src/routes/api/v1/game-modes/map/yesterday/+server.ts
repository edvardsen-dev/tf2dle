import { mapService } from '$lib/server/services/MapService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const yesterdayAnswer = await mapService.getYesterdaysAnswer();

	return json(yesterdayAnswer, { status: 200 });
}
