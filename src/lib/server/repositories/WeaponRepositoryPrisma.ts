import dayjs from '$lib/configs/dayjsConfig';
import type { Weapon } from '$lib/types';
import type { Dayjs } from 'dayjs';
import { db } from '$lib/prisma';
import type { WeaponRepository } from './WeaponRepository';

class WeaponRepositoryPrisma implements WeaponRepository {
	async incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void> {
		await db.dailyWeapons.updateMany({
			where: {
				selectedAt: date.toDate()
			},
			data: {
				hasWon: {
					increment: 1
				}
			}
		});
	}

	async getNumberOfCorrectGuesses(): Promise<number> {
		return await db.dailyWeapons
			.findFirst({
				where: {
					selectedAt: dayjs.utc().toDate()
				}
			})
			.then((weapon) => weapon?.hasWon ?? 0);
	}

	async getWeapon(date: Dayjs): Promise<string | null> {
		const weapon = await db.dailyWeapons.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});

		if (!weapon) {
			return null;
		}

		return weapon.name;
	}

	async save(weapon: Weapon, date: Dayjs) {
		await db.dailyWeapons.create({
			data: {
				selectedAt: date.toDate(),
				name: weapon.name,
				hasWon: 0
			}
		});
	}
}

export const weaponRepository = new WeaponRepositoryPrisma();
