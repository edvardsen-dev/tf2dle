import {
	createAdminSessionToken,
	isAdminEnabled,
	isValidAdminPassword,
	isValidAdminSessionToken
} from '$lib/server/adminAuth';
import { expect, test } from 'vitest';

test('admin is disabled without a password', () => {
	expect(isAdminEnabled(null)).toBe(false);
	expect(isAdminEnabled('secret')).toBe(true);
});

test('validates admin password through session token helper', () => {
	const password = 'correct horse battery staple';
	const token = createAdminSessionToken(password);

	expect(isValidAdminPassword(password, password)).toBe(true);
	expect(isValidAdminPassword('wrong', password)).toBe(false);
	expect(isValidAdminSessionToken(token, password)).toBe(true);
	expect(isValidAdminSessionToken('wrong-token', password)).toBe(false);
});
