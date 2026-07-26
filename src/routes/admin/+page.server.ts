import {
	clearAdminSessionCookie,
	getAdminPassword,
	isAdminAuthenticated,
	isAdminEnabled
} from '$lib/server/adminAuth';
import MetricsService from '$lib/server/services/MetricsService';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const adminPassword = getAdminPassword();

	if (!isAdminEnabled(adminPassword)) {
		error(404, 'Not found');
	}

	if (!isAdminAuthenticated(cookies, adminPassword)) {
		redirect(303, '/admin/login');
	}

	return {
		metrics: await MetricsService.getDashboardMetrics(url.searchParams.get('month'))
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		clearAdminSessionCookie(cookies);
		redirect(303, '/admin/login');
	}
};
