import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'tf2dle_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminPassword() {
	const password = env.ADMIN_PASSWORD;

	return password && password.trim().length > 0 ? password : null;
}

export function isAdminEnabled(password = getAdminPassword()) {
	return Boolean(password);
}

export function createAdminSessionToken(password: string) {
	return createHash('sha256').update(`tf2dle-admin-session:${password}`).digest('hex');
}

export function isValidAdminPassword(input: string, password: string | null) {
	if (!password) return false;

	return isValidAdminSessionToken(createAdminSessionToken(input), password);
}

export function isValidAdminSessionToken(token: string | undefined, password: string | null) {
	if (!token || !password) return false;

	const expectedToken = createAdminSessionToken(password);
	const tokenBuffer = Buffer.from(token, 'utf8');
	const expectedBuffer = Buffer.from(expectedToken, 'utf8');

	return (
		tokenBuffer.length === expectedBuffer.length && timingSafeEqual(tokenBuffer, expectedBuffer)
	);
}

export function isAdminAuthenticated(cookies: Cookies, password = getAdminPassword()) {
	return isValidAdminSessionToken(cookies.get(ADMIN_COOKIE_NAME), password);
}

export function setAdminSessionCookie(cookies: Cookies, password: string) {
	cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(password), {
		path: '/admin',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: COOKIE_MAX_AGE
	});
}

export function clearAdminSessionCookie(cookies: Cookies) {
	cookies.delete(ADMIN_COOKIE_NAME, {
		path: '/admin'
	});
}
