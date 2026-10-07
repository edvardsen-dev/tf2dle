import { db } from '../prisma';
import type { AppNotificationRepository } from './AppNotificationRepository';
import type { AppNotification } from '@prisma/client';
import type { NotificationLevel } from '$lib/types';

const APP_NOTIFICATION_ID = 1;

class AppNotificationRepositoryPrisma implements AppNotificationRepository {
	public async getAppNotification(): Promise<AppNotification | null> {
		return db.appNotification.findUnique({ where: { id: APP_NOTIFICATION_ID } });
	}

	public async update(type: NotificationLevel, content: string): Promise<void> {
		await db.appNotification.upsert({
			where: { id: APP_NOTIFICATION_ID },
			update: { type, content },
			create: {
				id: APP_NOTIFICATION_ID,
				version: 1,
				enabled: false,
				type,
				content
			}
		});
	}

	public async setEnabledState(enabled: boolean): Promise<void> {
		await db.appNotification.update({
			where: { id: APP_NOTIFICATION_ID },
			data: { enabled }
		});
	}
}

export const appNotificationRepository = new AppNotificationRepositoryPrisma();
