import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';
import { getAppNotification } from '$lib/server/use-cases/get-app-notification';
import { json } from '@sveltejs/kit';

/**
 *  Returns an app notification if any are active
 */
export async function GET() {
	const deps = { repo: appNotificationRepository };
	const notification = getAppNotification(deps);

	return json(notification, { status: 200 });
}
