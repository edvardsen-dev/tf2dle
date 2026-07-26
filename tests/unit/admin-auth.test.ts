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

test('validates admin password directly', () => {
	const password = 'correct horse battery staple';

	expect(isValidAdminPassword(password, password)).toBe(true);
	expect(isValidAdminPassword('wrong', password)).toBe(false);
	expect(isValidAdminPassword(password, null)).toBe(false);
});

test('validates signed admin session tokens', () => {
	const password = 'correct horse battery staple';
	const issuedAt = Date.UTC(2026, 6, 26, 12);
	const token = createAdminSessionToken(password, issuedAt);
	const laterToken = createAdminSessionToken(password, issuedAt + 1000);

	expect(token).not.toBe(laterToken);
	expect(isValidAdminSessionToken(token, password)).toBe(true);
	expect(isValidAdminSessionToken('wrong-token', password)).toBe(false);
	expect(isValidAdminSessionToken(token, 'wrong-password')).toBe(false);
});

test('rejects tampered, future, and expired admin session tokens', () => {
	const password = 'correct horse battery staple';
	const issuedAt = Date.UTC(2026, 6, 26, 12);
	const token = createAdminSessionToken(password, issuedAt);
	const [timestamp, signature] = token.split('.');

	expect(isValidAdminSessionToken(`${timestamp}0.${signature}`, password, issuedAt)).toBe(false);
	expect(isValidAdminSessionToken(token, password, issuedAt - 1)).toBe(false);
	expect(isValidAdminSessionToken(token, password, issuedAt + 60 * 60 * 24 * 7 * 1000)).toBe(true);
	expect(isValidAdminSessionToken(token, password, issuedAt + 60 * 60 * 24 * 7 * 1000 + 1)).toBe(
		false
	);
});
