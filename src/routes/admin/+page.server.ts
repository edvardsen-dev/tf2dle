import {
	clearAdminSessionCookie,
	getAdminPassword,
	isAdminAuthenticated,
	isAdminEnabled
} from '$lib/server/adminAuth';
import MetricsService from '$lib/server/services/MetricsService';
import { error, redirect, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	requireAdmin(cookies);

	const [metrics, metricsLoggingEnabled] = await Promise.all([
		MetricsService.getDashboardMetrics(url.searchParams.get('month')),
		MetricsService.isMetricsLoggingEnabled()
	]);

	return {
		metrics,
		metricsLoggingEnabled
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		clearAdminSessionCookie(cookies);
		redirect(303, '/admin/login');
	},
	setMetricsLogging: async ({ cookies, request, url }) => {
		requireAdmin(cookies);

		const formData = await request.formData();
		const enabled = formData.get('enabled') === 'true';

		await MetricsService.setMetricsLoggingEnabled(enabled);
		redirect(303, `/admin${url.search}`);
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
