import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type GetAppNotificationRepo = Pick<AppNotificationRepository, 'getAppNotification'>;

type Dependencies = {
	repo: GetAppNotificationRepo;
};

/**
 * Returns an app notification for an admin user with its state
 * (If its active or not)
 */
export async function getAdminAppNotification(deps: Dependencies) {
	return await deps.repo.getAppNotification();
}
