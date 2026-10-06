import type { NotificationLevel } from '$lib/types';
import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type UpdateAppNotificationRepo = Pick<AppNotificationRepository, 'update'>;

type Dependencies = {
	repo: UpdateAppNotificationRepo;
};

type Input = {
	type: NotificationLevel;
	content: string;
};

export async function updateAppNotification(deps: Dependencies, input: Input) {}
