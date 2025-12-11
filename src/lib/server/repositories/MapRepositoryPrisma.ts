import dayjs from '$lib/configs/dayjsConfig';
import type { Dayjs } from 'dayjs';
import { db } from '$lib/prisma';
import type { MapRepository } from './MapRepository';

class MapRepositoryPrisma implements MapRepository {
	public async save(name: string, pos: { x: number; y: number }, date: Dayjs) {
		return await db.dailyMaps.create({
			data: {
				selectedAt: date.toDate(),
				name,
				startingPosX: pos.x,
				startingPosY: pos.y
			}
		});
	}

	public async getTodaysMap() {
		return await db.dailyMaps.findFirst({
			where: {
				selectedAt: dayjs.utc().toDate()
			}
		});
	}

	public async getMap(date: Dayjs) {
		return await db.dailyMaps.findFirst({
			where: {
				selectedAt: date.toDate()
			}
		});
	}

	public async incrementTodaysNumberOfCorrectGuesses(date: Dayjs) {
		await db.dailyMaps.updateMany({
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

export const mapRepository = new MapRepositoryPrisma();
