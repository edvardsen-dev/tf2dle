import type { Unusual } from '#lib/types.ts';
import type { Dayjs } from 'dayjs';
import type { UnusualRepository } from '#lib/server/repositories/UnusualRepository.ts';
import { db } from '#lib/server/prisma.ts';
import dayjs from '#lib/configs/dayjsConfig.ts';

class UnusualRepositoryPrisma implements UnusualRepository {
	public async findUnusual(date: Dayjs) {
		return await db.dailyUnusuals.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});
	}

	public async saveUnusualForCurrentDate(unusual: Unusual, rotation: number, date: Dayjs) {
		return await db.dailyUnusuals.create({
			data: {
				selectedAt: date.toDate(),
				name: unusual.name,
				thumbnail: unusual.image,
				rotation,
				series: unusual.series
			}
		});
	}

	public async incrementNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyUnusuals.updateMany({
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

export const unusualRepository = new UnusualRepositoryPrisma();
