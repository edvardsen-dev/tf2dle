import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type GetAppNotificationRepo = Pick<AppNotificationRepository, 'getAppNotification'>;

type Dependencies = {
	repo: GetAppNotificationRepo;
};

/**
 * Returns an app notification for users of the app if active.
 * If no notification is active, 'null' is returned
 */
export async function getAppNotification(deps: Dependencies) {
	const notification = await deps.repo.getAppNotification();

	if (!notification || !notification.enabled) return null;

	const { id, enabled, ...rest } = notification;

	return rest;
}
