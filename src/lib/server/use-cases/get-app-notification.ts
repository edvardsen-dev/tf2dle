import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type GetAppNotificationRepo = Pick<AppNotificationRepository, 'getAppNotification'>;

type Dependencies = {
	repo: GetAppNotificationRepo;
};

export async function getAppNotification(deps: Dependencies) {
	const notification = await deps.repo.getAppNotification();

	if (!notification || notification.enabled) return null;

	return notification;
}
