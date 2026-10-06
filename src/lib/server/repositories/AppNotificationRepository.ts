import type { AppNotification } from '@prisma/client';

export interface AppNotificationRepository {
	getAppNotification(): Promise<AppNotification | null>;
}
