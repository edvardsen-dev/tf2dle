import { weaponService } from '#lib/server/services/WeaponService.ts';

/**
 * Returns a list of all weapon names
 * @returns all weapon names
 */
export async function GET() {
	const maps = weaponService.getWeaponNames();

	return Response.json(maps, { status: 200 });
}
