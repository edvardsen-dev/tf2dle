import { beforeEach, expect, test, vi } from 'vitest';

const { db } = vi.hoisted(() => ({
	db: {
		adminSettings: {
			findUnique: vi.fn(),
			upsert: vi.fn()
		},
		dailyGameModeMetrics: {
			upsert: vi.fn()
		},
		dailyPageMetrics: {
			upsert: vi.fn()
		}
	}
}));

vi.mock('$lib/server/prisma', () => ({ db }));

import MetricsService from '$lib/server/services/MetricsService';

beforeEach(() => {
	vi.clearAllMocks();
});

test('metrics logging defaults to enabled when settings are missing', async () => {
	db.adminSettings.findUnique.mockResolvedValue(null);

	await expect(MetricsService.isMetricsLoggingEnabled()).resolves.toBe(true);
});

test('updates metrics logging setting', async () => {
	db.adminSettings.upsert.mockResolvedValue({ metricsLoggingEnabled: false });

	await expect(MetricsService.setMetricsLoggingEnabled(false)).resolves.toBe(false);
	expect(db.adminSettings.upsert).toHaveBeenCalledWith({
		where: {
			id: 1
		},
		create: {
			id: 1,
			metricsLoggingEnabled: false
		},
		update: {
			metricsLoggingEnabled: false
		},
		select: {
			metricsLoggingEnabled: true
		}
	});
});

test('skips game metrics when logging is disabled', async () => {
	db.adminSettings.findUnique.mockResolvedValue({ metricsLoggingEnabled: false });

	await MetricsService.recordGameGuess('weapon', 1, false);

	expect(db.dailyGameModeMetrics.upsert).not.toHaveBeenCalled();
});

test('records page metrics when logging is enabled', async () => {
	db.adminSettings.findUnique.mockResolvedValue({ metricsLoggingEnabled: true });
	db.dailyPageMetrics.upsert.mockResolvedValue({});

	await MetricsService.recordPageView('/patch-notes');

	expect(db.dailyPageMetrics.upsert).toHaveBeenCalledWith(
		expect.objectContaining({
			create: expect.objectContaining({
				path: '/patch-notes',
				views: 1
			}),
			update: {
				views: {
					increment: 1
				}
			}
		})
	);
});
