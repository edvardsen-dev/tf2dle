import { unusualService } from '#lib/server/services/UnusualService.ts';

/**
 * Retursn a list of all unusuals
 * @returns the name and thumbnail of all unusuals
 */
export async function GET() {
	const unusuals = unusualService.getUnusuals();

	return Response.json(
		unusuals.map((u) => ({ name: u.name, thumbnail: u.image })),
		{ status: 200 }
	);
}
