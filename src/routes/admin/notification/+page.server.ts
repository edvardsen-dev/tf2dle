import { getAdminPassword, isAdminAuthenticated, isAdminEnabled } from '$lib/server/adminAuth';
import { error, redirect, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAdminAppNotification } from '$lib/server/use-cases/get-admin-app-notification';
import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdmin(cookies);

	const notification = await getAdminAppNotification({
		repo: appNotificationRepository
	});

	return {
		notification
	};
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
