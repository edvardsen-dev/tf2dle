import type { AppNotification } from '#lib/server/generated/prisma/browser.ts';
import { updateAppNotification } from '#lib/server/use-cases/update-app-notification.ts';
import { NotificationLevel } from '#lib/types.ts';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const repo = {
	getAppNotification: vi.fn<() => Promise<AppNotification | null>>(),
	update: vi.fn<(type: NotificationLevel, content: string) => Promise<void>>()
};

const notification: AppNotification = {
	id: 1,
	version: 3,
	enabled: false,
	type: 'info',
	content: 'Saved announcement'
};

const input = {
	type: NotificationLevel.WARNING,
	content: 'Updated announcement'
};

beforeEach(() => {
	vi.resetAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

test.each([
	['disabled', notification],
	['missing', null]
])('saves the notification when it is %s', async (_, storedNotification) => {
	repo.getAppNotification.mockResolvedValue(storedNotification);
	repo.update.mockResolvedValue(undefined);

	await expect(updateAppNotification({ repo }, input)).resolves.toEqual({ ok: true });
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
	expect(repo.update).toHaveBeenCalledOnce();
	expect(repo.update).toHaveBeenCalledWith(input.type, input.content);
});

test('returns notification_enabled without updating when the notification is enabled', async () => {
	repo.getAppNotification.mockResolvedValue({ ...notification, enabled: true });

	await expect(updateAppNotification({ repo }, input)).resolves.toEqual({
		ok: false,
		reason: 'notification_enabled'
	});
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
	expect(repo.update).not.toHaveBeenCalled();
});

test('returns db_error without updating when the lookup fails', async () => {
	const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const error = new Error('Database unavailable');
	repo.getAppNotification.mockRejectedValue(error);

	await expect(updateAppNotification({ repo }, input)).resolves.toEqual({
		ok: false,
		reason: 'db_error'
	});
	expect(repo.update).not.toHaveBeenCalled();
	expect(logError).toHaveBeenCalledWith(error);
});

test('returns db_error when updating the notification fails', async () => {
	const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const error = new Error('Database unavailable');
	repo.getAppNotification.mockResolvedValue(notification);
	repo.update.mockRejectedValue(error);

	await expect(updateAppNotification({ repo }, input)).resolves.toEqual({
		ok: false,
		reason: 'db_error'
	});
	expect(repo.update).toHaveBeenCalledOnce();
	expect(repo.update).toHaveBeenCalledWith(input.type, input.content);
	expect(logError).toHaveBeenCalledWith(error);
});
