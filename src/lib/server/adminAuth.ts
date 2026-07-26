import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'tf2dle_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = COOKIE_MAX_AGE * 1000;

export function getAdminPassword() {
	const password = env.ADMIN_PASSWORD;

	return password && password.trim().length > 0 ? password : null;
}

export function isAdminEnabled(password = getAdminPassword()) {
	return Boolean(password);
}

export function createAdminSessionToken(password: string, issuedAt = Date.now()) {
	const timestamp = String(issuedAt);

	return `${timestamp}.${signAdminSessionTimestamp(timestamp, password)}`;
}

export function isValidAdminPassword(input: string, expectedPassword: string | null) {
	return safeCompare(input, expectedPassword);
}

export function isValidAdminSessionToken(
	token: string | undefined,
	password: string | null,
	now = Date.now()
) {
	if (!password) return false;

	const [timestamp, signature] = token?.split('.') ?? [];
	const issuedAt = Number(timestamp);

	if (!timestamp || !signature || !Number.isInteger(issuedAt)) return false;
	if (issuedAt > now || now - issuedAt > SESSION_MAX_AGE_MS) return false;

	const expectedSignature = signAdminSessionTimestamp(timestamp, password);

	return safeCompare(signature, expectedSignature);
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

function safeCompare(actual: string | undefined | null, expected: string | undefined | null) {
	if (!actual || !expected) return false;

	const actualBuffer = Buffer.from(actual, 'utf8');
	const expectedBuffer = Buffer.from(expected, 'utf8');

	return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function signAdminSessionTimestamp(timestamp: string, password: string) {
	return createHmac('sha256', password).update(`tf2dle-admin-session:${timestamp}`).digest('hex');
}
