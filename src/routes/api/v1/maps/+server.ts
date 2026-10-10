import { mapService } from '#lib/server/services/MapService.ts';

/**
 * Returns a list of all maps
 * @returns all maps
 */
export async function GET() {
	const maps = mapService.getMaps();

	return Response.json(maps);
}
