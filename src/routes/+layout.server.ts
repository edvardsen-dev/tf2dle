import { appNotificationRepository } from '#lib/server/repositories/AppNotificationRepositoryPrisma.ts';
import { getAppNotification } from '#lib/server/use-cases/get-app-notification.ts';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const res = await getAppNotification({
		repo: appNotificationRepository
	});
	const notification = res.ok ? res.notification : null;

	return { notification };
}) satisfies LayoutServerLoad;
