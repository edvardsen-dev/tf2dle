import type { Cosmetic } from '$lib/types';
import type { Dayjs } from 'dayjs';
import { db } from '../prisma';
import type { CosmeticRepository } from './CosmeticRepository';

class CosmeticRepositoryPrisma implements CosmeticRepository {
	public async findCosmetic(date: Dayjs) {
		return await db.dailyCosmetics.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});
	}

	public async saveTodaysCosmetic(cosmetic: Cosmetic, rotation: number, date: Dayjs) {
		return await db.dailyCosmetics.create({
			data: {
				selectedAt: date.toDate(),
				name: cosmetic.name,
				thumbnail: cosmetic.image,
				rotation: rotation,
				usedBy: cosmetic.usedBy
			}
		});
	}

	public async incrementNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyCosmetics.updateMany({
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

export const cosmeticRepository = new CosmeticRepositoryPrisma();
