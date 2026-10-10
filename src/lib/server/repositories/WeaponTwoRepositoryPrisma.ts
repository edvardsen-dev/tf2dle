import type { Dayjs } from 'dayjs';
import type { WeaponTwoRepository } from '#lib/server/repositories/WeaponTwoRepository.ts';
import { db } from '#lib/server/prisma.ts';
import type { Weapon } from '#lib/types.ts';
import dayjs from '#lib/configs/dayjsConfig.ts';

class WeaponTwoRepositoryPrisma implements WeaponTwoRepository {
	public async findWeapon(date: Dayjs) {
		return await db.dailyWeaponsTwo.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});
	}

	public async saveWeapon(weapon: Weapon, date: Dayjs) {
		return await db.dailyWeaponsTwo.create({
			data: {
				selectedAt: date.toDate(),
				name: weapon.name
			}
		});
	}

	public async incrementNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyWeaponsTwo.updateMany({
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
}

export const weaponTwoRepository = new WeaponTwoRepositoryPrisma();
