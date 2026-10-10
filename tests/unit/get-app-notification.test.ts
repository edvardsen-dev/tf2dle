import type { AppNotification } from '#lib/server/generated/prisma/browser.ts';
import { getAppNotification } from '#lib/server/use-cases/get-app-notification.ts';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const repo = {
	getAppNotification: vi.fn<() => Promise<AppNotification | null>>()
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

test('returns a successful empty result when no notification exists', async () => {
	repo.getAppNotification.mockResolvedValue(null);

	await expect(getAppNotification({ repo })).resolves.toEqual({ ok: true, notification: null });
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
});

test('returns a successful empty result when the notification is disabled', async () => {
	repo.getAppNotification.mockResolvedValue({ ...notification, enabled: false });

	await expect(getAppNotification({ repo })).resolves.toEqual({ ok: true, notification: null });
});

test('returns an enabled notification without id or enabled and leaves the original unchanged', async () => {
	const storedNotification = { ...notification };
	repo.getAppNotification.mockResolvedValue(storedNotification);

	await expect(getAppNotification({ repo })).resolves.toEqual({
		ok: true,
		notification: {
			version: notification.version,
			type: notification.type,
			content: notification.content
		}
	});
	expect(storedNotification).toEqual(notification);
});

test('logs repository errors and returns db_error', async () => {
	const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const error = new Error('Database unavailable');
	repo.getAppNotification.mockRejectedValue(error);

	await expect(getAppNotification({ repo })).resolves.toEqual({ ok: false, reason: 'db_error' });
	expect(logError).toHaveBeenCalledWith(error);
});
