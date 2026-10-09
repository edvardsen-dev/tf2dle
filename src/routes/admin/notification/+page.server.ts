import { getAdminPassword, isAdminAuthenticated, isAdminEnabled } from '$lib/server/adminAuth';
import { error, fail, redirect, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAdminAppNotification } from '$lib/server/use-cases/get-admin-app-notification';
import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';
import { setAppNotificationActive } from '$lib/server/use-cases/set-app-notification-active';
import { updateAppNotification } from '$lib/server/use-cases/update-app-notification';
import { NotificationLevel } from '$lib/types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdmin(cookies);

	const res = await getAdminAppNotification({
		repo: appNotificationRepository
	});

	const notification = res.ok ? res.data : null;

	return {
		notification
	};
};

export const actions: Actions = {
	setActiveState: async ({ cookies, request }) => {
		requireAdmin(cookies);

		const formData = await request.formData();
		const enabled = formData.get('enabled');
		if (enabled !== 'true' && enabled !== 'false') {
			return fail(400, {
				action: 'setActiveState' as const,
				message: 'Could not read the visibility setting. Refresh the page and try again.'
			});
		}

		const res = await setAppNotificationActive(
			{ repo: appNotificationRepository },
			{ enabled: enabled === 'true' }
		);

		if (!res.ok) {
			const reason = res.reason;
			switch (reason) {
				case 'not_found':
					return fail(404, {
						action: 'setActiveState' as const,
						message: 'Save a notification before enabling it.'
					});
				case 'db_error':
					return fail(500, {
						action: 'setActiveState' as const,
						message:
							'Could not change visibility. The previous setting was restored. Please try again.'
					});
				default:
					return fail(500, {
						action: 'setActiveState' as const,
						message: `Unhandled error: ${reason satisfies never}`
					});
			}
		}

		return { action: 'setActiveState' as const, success: true };
	},
	update: async ({ cookies, request }) => {
		requireAdmin(cookies);

		const formData = await request.formData();
		const type = formData.get('type') as string;
		const content = formData.get('content');

		if (!type || !['info', 'warning', 'error'].includes(type)) {
			return fail(400, {
				action: 'update' as const,
				message: 'Choose Info, Warning, or Error as the notification type.'
			});
		}

		if (typeof content !== 'string' || !content.trim() || content.length > 500) {
			return fail(400, {
				action: 'update' as const,
				message: 'Enter a message between 1 and 500 characters.'
			});
		}

		const res = await updateAppNotification(
			{ repo: appNotificationRepository },
			{ type: type as NotificationLevel, content }
		);

		if (!res.ok) {
			const reason = res.reason;
			switch (reason) {
				case 'db_error':
					return fail(500, {
						action: 'update' as const,
						message: 'Could not save the notification. Your edits are still here. Please try again.'
					});
				case 'notification_enabled':
					return fail(500, {
						action: 'update' as const,
						message: 'Cannot update notification when its enabled. Disable it before updating.'
					});
				default:
					return fail(500, {
						action: 'update' as const,
						message: `Unhandled error: ${reason satisfies never}`
					});
			}
		}

		return { action: 'update' as const, success: true };
	}
};

function requireAdmin(cookies: Cookies) {
	const adminPassword = getAdminPassword();
	if (!isAdminEnabled(adminPassword)) {
		error(404, 'Not found');
	}
	if (!isAdminAuthenticated(cookies, adminPassword)) {
		redirect(303, '/admin/login');
	}
}
