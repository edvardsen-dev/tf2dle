import type { AppNotification } from '@prisma/client';
import { getAppNotification } from '$lib/server/use-cases/get-app-notification';
import { beforeEach, expect, test, vi } from 'vitest';

const repo = {
	getAppNotification: vi.fn<[], Promise<AppNotification | null>>()
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

test('returns null when no notification exists', async () => {
	repo.getAppNotification.mockResolvedValue(null);

	await expect(getAppNotification({ repo })).resolves.toBeNull();
	expect(repo.getAppNotification).toHaveBeenCalledOnce();
});

test('returns null when the notification is disabled', async () => {
	repo.getAppNotification.mockResolvedValue({ ...notification, enabled: false });

	await expect(getAppNotification({ repo })).resolves.toBeNull();
});

test('returns an enabled notification without the enabled field and leaves the original unchanged', async () => {
	const storedNotification = { ...notification };
	repo.getAppNotification.mockResolvedValue(storedNotification);

	await expect(getAppNotification({ repo })).resolves.toEqual({
		id: notification.id,
		version: notification.version,
		type: notification.type,
		content: notification.content
	});
	expect(storedNotification).toEqual(notification);
});

test('propagates repository errors', async () => {
	const error = new Error('Database unavailable');
	repo.getAppNotification.mockRejectedValue(error);

	await expect(getAppNotification({ repo })).rejects.toBe(error);
});
