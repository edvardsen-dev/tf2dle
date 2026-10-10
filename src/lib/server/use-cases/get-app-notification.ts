import type { AppNotification } from '#lib/types.ts';
import type { AppNotificationRepository } from '#lib/server/repositories/AppNotificationRepository.ts';

type GetAppNotificationRepo = Pick<AppNotificationRepository, 'getAppNotification'>;

type Dependencies = {
	repo: GetAppNotificationRepo;
};

type Result =
	{ ok: true; notification: AppNotification | null } | { ok: false; reason: 'db_error' };

/**
 * Returns an app notification for users of the app if active.
 * If no notification is active, 'null' is returned
 */
export async function getAppNotification(deps: Dependencies): Promise<Result> {
	try {
		const notification = await deps.repo.getAppNotification();

		if (!notification || !notification.enabled) return { ok: true, notification: null };

		const { id, enabled, ...rest } = notification;

		return { ok: true, notification: rest as AppNotification };
	} catch (err) {
		console.error(err);
		return { ok: false, reason: 'db_error' };
	}
}
