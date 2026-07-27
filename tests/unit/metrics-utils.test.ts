import dayjs from '$lib/configs/dayjsConfig';
import {
	buildDashboardMetrics,
	normalizeAttemptNumber,
	resolveMonthSelection
} from '$lib/server/metricsUtils';
import { expect, test } from 'vitest';

test('normalizes invalid attempt numbers to first attempt', () => {
	expect(normalizeAttemptNumber(undefined)).toBe(1);
	expect(normalizeAttemptNumber(0)).toBe(1);
	expect(normalizeAttemptNumber(1.5)).toBe(1);
	expect(normalizeAttemptNumber(3)).toBe(3);
	expect(normalizeAttemptNumber('4')).toBe(4);
});

test('resolves invalid and future months to current UTC month', () => {
	const now = dayjs.utc('2026-07-26T12:00:00Z');

	expect(resolveMonthSelection(null, now).monthParam).toBe('2026-07');
	expect(resolveMonthSelection('bad-input', now).monthParam).toBe('2026-07');
	expect(resolveMonthSelection('2026-08', now).monthParam).toBe('2026-07');
	expect(resolveMonthSelection('2026-06', now).monthParam).toBe('2026-06');
});

test('builds zero-filled monthly dashboard metrics', () => {
	const selection = resolveMonthSelection('2026-07', dayjs.utc('2026-08-01T12:00:00Z'));
	const metrics = buildDashboardMetrics(
		selection,
		[
			{
				date: dayjs.utc('2026-07-01').toDate(),
				gameMode: 'weapon',
				starts: 2,
				guesses: 8,
				wins: 1,
				totalGuessesToWin: 4
			},
			{
				date: dayjs.utc('2026-07-02').toDate(),
				gameMode: 'map',
				starts: 3,
				guesses: 9,
				wins: 3,
				totalGuessesToWin: 7
			}
		],
		[
			{
				date: dayjs.utc('2026-07-02').toDate(),
				path: '/patch-notes',
				views: 5
			}
		],
		dayjs.utc('2026-08-01T12:00:00Z')
	);

	expect(metrics.daily).toHaveLength(31);
	expect(metrics.daily[0]).toMatchObject({ starts: 2, guesses: 8, wins: 1, patchNotesViews: 0 });
	expect(metrics.daily[1]).toMatchObject({ starts: 3, guesses: 9, wins: 3, patchNotesViews: 5 });
	expect(metrics.daily[30]).toMatchObject({ starts: 0, guesses: 0, wins: 0, patchNotesViews: 0 });
	expect(metrics.kpis).toMatchObject({ starts: 5, guesses: 17, wins: 4, patchNotesViews: 5 });
	expect(metrics.kpis.solveRate).toBe(0.8);
	expect(metrics.kpis.averageGuessesToWin).toBe(2.75);
	expect(metrics.modes.find((mode) => mode.gameMode === 'map')).toMatchObject({
		starts: 3,
		guesses: 9,
		wins: 3,
		solveRate: 1
	});
});

test('hides future days for the selected current month', () => {
	const now = dayjs.utc('2026-07-26T12:00:00Z');
	const selection = resolveMonthSelection('2026-07', now);
	const metrics = buildDashboardMetrics(selection, [], [], now);

	expect(metrics.daily).toHaveLength(26);
	expect(metrics.dailyModes).toHaveLength(26);
	expect(metrics.daily.at(-1)?.date).toBe('2026-07-26');
});
