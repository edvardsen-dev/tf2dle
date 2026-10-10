import type { NotificationLevel } from '#lib/types.ts';
import type { AppNotificationRepository } from '#lib/server/repositories/AppNotificationRepository.ts';

type UpdateAppNotificationRepo = Pick<AppNotificationRepository, 'update' | 'getAppNotification'>;

type Dependencies = {
	repo: UpdateAppNotificationRepo;
};

type Input = {
	type: NotificationLevel;
	content: string;
};

type Result =
	{ ok: true } | { ok: false; reason: 'db_error' } | { ok: false; reason: 'notification_enabled' };

export async function updateAppNotification(deps: Dependencies, input: Input): Promise<Result> {
	try {
		const found = await deps.repo.getAppNotification();
		if (found?.enabled) {
			return { ok: false, reason: 'notification_enabled' };
		}

		await deps.repo.update(input.type, input.content);
	} catch (err) {
		console.error(err);
		return { ok: false, reason: 'db_error' };
	}
	return { ok: true };
}
