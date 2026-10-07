import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';
import { getAppNotification } from '$lib/server/use-cases/get-app-notification';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const notification = await getAppNotification({
		repo: appNotificationRepository
	});

	return { notification };
}) satisfies LayoutServerLoad;
