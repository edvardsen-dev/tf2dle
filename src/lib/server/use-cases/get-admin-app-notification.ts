import type { AdminAppNotification } from '$lib/types';
import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type GetAppNotificationRepo = Pick<AppNotificationRepository, 'getAppNotification'>;

type Dependencies = {
	repo: GetAppNotificationRepo;
};

type Result = { ok: true; data: AdminAppNotification | null } | { ok: false; reason: 'db_error' };

/**
 * Returns an app notification for an admin user with its state
 * (If its active or not)
 */
export async function getAdminAppNotification(deps: Dependencies): Promise<Result> {
	try {
		const notification = await deps.repo.getAppNotification();
		return { ok: true, data: notification as AdminAppNotification };
	} catch (err) {
		console.error(err);
		return { ok: false, reason: 'db_error' };
	}
}
