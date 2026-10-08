import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';
import { getAppNotification } from '$lib/server/use-cases/get-app-notification';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const res = await getAppNotification({
		repo: appNotificationRepository
	});
	const notification = res.ok ? res.notification : null;

	return { notification };
}) satisfies LayoutServerLoad;
