import { db } from '../prisma';
import type { AppNotificationRepository } from './AppNotificationRepository';
import type { AppNotification } from '@prisma/client';

class AppNotificationRepositoryPrisma implements AppNotificationRepository {
	public async getAppNotification(): Promise<AppNotification | null> {
		return db.appNotification.findFirst();
	}
}

export const appNotificationRepository = new AppNotificationRepositoryPrisma();
