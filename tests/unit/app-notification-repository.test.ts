import { beforeEach, expect, test, vi } from 'vitest';
import { NotificationLevel } from '#lib/types.ts';

const { db } = vi.hoisted(() => ({
	db: {
		appNotification: {
			findUnique: vi.fn(),
			upsert: vi.fn(),
			update: vi.fn()
		}
	}
}));

vi.mock('#lib/server/prisma.ts', () => ({ db }));

import { appNotificationRepository } from '#lib/server/repositories/AppNotificationRepositoryPrisma.ts';

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

test('increments the version atomically when enabling the notification', async () => {
	db.appNotification.update.mockResolvedValue({ id: 1 });

	await expect(appNotificationRepository.setEnabledState(true)).resolves.toBeUndefined();
	expect(db.appNotification.update).toHaveBeenCalledOnce();
	expect(db.appNotification.update).toHaveBeenCalledWith({
		where: { id: 1 },
		data: { enabled: true, version: { increment: 1 } }
	});
});

test('leaves the version unchanged when disabling the notification', async () => {
	db.appNotification.update.mockResolvedValue({ id: 1 });

	await expect(appNotificationRepository.setEnabledState(false)).resolves.toBeUndefined();
	expect(db.appNotification.update).toHaveBeenCalledOnce();
	expect(db.appNotification.update).toHaveBeenCalledWith({
		where: { id: 1 },
		data: { enabled: false }
	});
});

test('propagates database errors when updating', async () => {
	const error = new Error('Database unavailable');
	db.appNotification.upsert.mockRejectedValue(error);

	await expect(appNotificationRepository.update(NotificationLevel.INFO, 'News')).rejects.toBe(
		error
	);
});
