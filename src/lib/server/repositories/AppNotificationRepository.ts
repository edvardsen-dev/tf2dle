import type { NotificationLevel } from '$lib/types';
import type { AppNotification } from '@prisma/client';

export interface AppNotificationRepository {
	getAppNotification(): Promise<AppNotification | null>;
	update(type: NotificationLevel, content: string): Promise<void>;
	setEnabledState(enabled: boolean): Promise<void>;
}
