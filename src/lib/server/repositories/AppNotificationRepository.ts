import type { NotificationLevel } from '#lib/types.ts';
import type { AppNotification } from '#lib/server/generated/prisma/browser.ts';

export interface AppNotificationRepository {
	getAppNotification(): Promise<AppNotification | null>;
	update(type: NotificationLevel, content: string): Promise<void>;
	setEnabledState(enabled: boolean): Promise<void>;
}
