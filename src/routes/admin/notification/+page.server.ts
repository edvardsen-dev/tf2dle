import { getAdminPassword, isAdminAuthenticated, isAdminEnabled } from '$lib/server/adminAuth';
import { error, fail, redirect, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAdminAppNotification } from '$lib/server/use-cases/get-admin-app-notification';
import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';
import { setAppNotificationActive } from '$lib/server/use-cases/set-app-notification-active';

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
				message: 'Enabled must be true or false.'
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
						message: 'Save a notification before you can enable it!'
					});
				case 'db_error':
					return fail(500, {
						action: 'setActiveState' as const,
						message: 'Could not update the notification. Please try again.'
					});
				default:
					return fail(500, {
						action: 'setActiveState' as const,
						message: `Unhandled error: ${reason satisfies never}`
					});
			}
		}

		return { action: 'setActiveState' as const, success: true };
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
