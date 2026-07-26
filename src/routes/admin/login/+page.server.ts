import {
	getAdminPassword,
	isAdminAuthenticated,
	isAdminEnabled,
	isValidAdminPassword,
	setAdminSessionCookie
} from '$lib/server/adminAuth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const adminPassword = getAdminPassword();

	if (!isAdminEnabled(adminPassword)) {
		error(404, 'Not found');
	}

	if (isAdminAuthenticated(cookies, adminPassword)) {
		redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const adminPassword = getAdminPassword();

		if (!isAdminEnabled(adminPassword)) {
			error(404, 'Not found');
		}

		const formData = await request.formData();
		const password = formData.get('password');

		if (typeof password !== 'string' || !isValidAdminPassword(password, adminPassword)) {
			return fail(400, { message: 'Invalid password' });
		}

		setAdminSessionCookie(cookies, adminPassword!);
		redirect(303, '/admin');
	}
};
