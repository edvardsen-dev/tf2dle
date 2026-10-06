import { beforeEach, expect, test, vi } from 'vitest';
import { NotificationLevel } from '$lib/types';

const { db } = vi.hoisted(() => ({
	db: {
		appNotification: {
			findUnique: vi.fn(),
			upsert: vi.fn()
		}
	}
}));

vi.mock('$lib/server/prisma', () => ({ db }));

import { appNotificationRepository } from '$lib/server/repositories/AppNotificationRepositoryPrisma';

beforeEach(() => {
	vi.resetAllMocks();
});

test('reads the same singleton notification used by updates', async () => {
	db.appNotification.findUnique.mockResolvedValue(null);

	await expect(appNotificationRepository.getAppNotification()).resolves.toBeNull();
	expect(db.appNotification.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
});

test('upserts type and content, defaulting only new notifications to disabled', async () => {
	db.appNotification.upsert.mockResolvedValue({ id: 1 });

	await expect(
		appNotificationRepository.update(NotificationLevel.WARNING, 'Scheduled maintenance')
	).resolves.toBeUndefined();
	expect(db.appNotification.upsert).toHaveBeenCalledTimes(1);
	expect(db.appNotification.upsert).toHaveBeenCalledWith({
		where: { id: 1 },
		update: { type: 'warning', content: 'Scheduled maintenance' },
		create: {
			id: 1,
			version: 1,
			enabled: false,
			type: 'warning',
			content: 'Scheduled maintenance'
		}
	});
});

test('propagates database errors when updating', async () => {
	const error = new Error('Database unavailable');
	db.appNotification.upsert.mockRejectedValue(error);

	await expect(appNotificationRepository.update(NotificationLevel.INFO, 'News')).rejects.toBe(
		error
	);
});
