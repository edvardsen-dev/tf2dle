import { cosmeticService } from '$lib/server/services/CosmeticService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const yesterdaysAnswer = await cosmeticService.getYesterdaysAnswer();

	return json(yesterdaysAnswer, { status: 200 });
}
