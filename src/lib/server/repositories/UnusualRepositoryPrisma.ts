import type { Unusual } from '$lib/types';
import type { Dayjs } from 'dayjs';
import type { UnusualRepository } from './UnusualRepository';
import { db } from '../prisma';
import dayjs from '$lib/configs/dayjsConfig';

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
