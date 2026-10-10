import { cosmeticService } from '#lib/server/services/CosmeticService.ts';

/**
 * Returns a list of all cosmetics
 * @returns the names and thumbnails of all cosmetics
 */
export async function GET() {
	const cosmetics = cosmeticService.getCosmetics();

	return Response.json(
		cosmetics.map((c) => ({ name: c.name, thumbnail: c.image })),
		{ status: 200 }
	);
}
