import type { AppNotification } from '@prisma/client';
import { setAppNotificationActive } from '$lib/server/use-cases/set-app-notification-active';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const repo = {
	getAppNotification: vi.fn<[], Promise<AppNotification | null>>(),
	setEnabledState: vi.fn<[boolean], Promise<void>>()
};

const notification: AppNotification = {
	id: 1,
	version: 3,
	enabled: true,
	type: 'warning',
	content: 'The site may be temporarily unavailable.'
};

beforeEach(() => {
	vi.resetAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

test.each([true, false])('sets the notification enabled state to %s', async (enabled) => {
	repo.getAppNotification.mockResolvedValue({ ...notification, enabled: !enabled });
	repo.setEnabledState.mockResolvedValue(undefined);

	await expect(setAppNotificationActive({ repo }, { enabled })).resolves.toEqual({ ok: true });
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
	expect(repo.setEnabledState).toHaveBeenCalledOnce();
	expect(repo.setEnabledState).toHaveBeenCalledWith(enabled);
});

test('returns not_found without updating when no notification exists', async () => {
	repo.getAppNotification.mockResolvedValue(null);

	await expect(setAppNotificationActive({ repo }, { enabled: true })).resolves.toEqual({
		ok: false,
		reason: 'not_found'
	});
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
	expect(repo.setEnabledState).not.toHaveBeenCalled();
});

test('returns db_error without updating when the lookup fails', async () => {
	vi.spyOn(console, 'log').mockImplementation(() => {});
	repo.getAppNotification.mockRejectedValue(new Error('Database unavailable'));

	await expect(setAppNotificationActive({ repo }, { enabled: true })).resolves.toEqual({
		ok: false,
		reason: 'db_error'
	});
	expect(repo.setEnabledState).not.toHaveBeenCalled();
});

test('returns db_error when updating the enabled state fails', async () => {
	vi.spyOn(console, 'log').mockImplementation(() => {});
	repo.getAppNotification.mockResolvedValue(notification);
	repo.setEnabledState.mockRejectedValue(new Error('Database unavailable'));

	await expect(setAppNotificationActive({ repo }, { enabled: false })).resolves.toEqual({
		ok: false,
		reason: 'db_error'
	});
	expect(repo.setEnabledState).toHaveBeenCalledOnce();
	expect(repo.setEnabledState).toHaveBeenCalledWith(false);
});
