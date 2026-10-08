import { enhance } from '$app/forms';
import { page } from '$app/stores';
import dayjs from '$lib/configs/dayjsConfig';
import { buildDashboardMetrics, resolveMonthSelection } from '$lib/server/metricsUtils';
import { cleanup, render, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { Writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from '../../src/routes/admin/+layout.svelte';
import MetricsPage from '../../src/routes/admin/+page.svelte';

vi.mock('$app/stores', async () => {
	const { writable } = await import('svelte/store');
	return { page: writable() };
});

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock('chart.js/auto', () => ({
	default: class {
		update() {}
		destroy() {}
	}
}));

const pageStore = page as unknown as Writable<{
	route: { id: string };
	url: URL;
	data: Record<string, unknown>;
}>;
const now = dayjs.utc('2026-07-26T12:00:00Z');

beforeEach(() => {
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			observe() {}
			disconnect() {}
		}
	);
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => ({
			ok: true,
			json: async () => ({ items: [], nextCursor: null, hasMore: false })
		}))
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('admin navigation', () => {
	it('tracks the active page independently of metrics data and query parameters', async () => {
		pageStore.set({
			route: { id: '/admin' },
			url: new URL('http://localhost/admin?month=2026-06'),
			data: {}
		});
		const { getByRole, queryByRole } = render(AdminLayout);
		const metrics = getByRole('link', { name: 'Metrics' });
		const notification = getByRole('link', { name: 'Notification' });
		expect(metrics.getAttribute('href')).toBe('/admin');
		expect(notification.getAttribute('href')).toBe('/admin/notification');
		expect(metrics.getAttribute('aria-current')).toBe('page');
		expect(notification.hasAttribute('aria-current')).toBe(false);
		expect(queryByRole('navigation', { name: 'Dashboard month' })).toBeNull();
		expect(queryByRole('button', { name: 'Metrics logging' })).toBeNull();

		pageStore.set({
			route: { id: '/admin/notification' },
			url: new URL('http://localhost/admin/notification'),
			data: { notification: null }
		});
		await tick();
		expect(metrics.hasAttribute('aria-current')).toBe(false);
		expect(notification.getAttribute('aria-current')).toBe('page');
		expect(getByRole('button', { name: 'Logout' }).closest('form')?.getAttribute('action')).toBe(
			'/admin?/logout'
		);
		expect(getByRole('link', { name: 'Open app' }).getAttribute('href')).toBe('/');
	});

	it('keeps admin links and logout off the login page', () => {
		pageStore.set({
			route: { id: '/admin/login' },
			url: new URL('http://localhost/admin/login'),
			data: {}
		});
		const { getByRole, queryByRole } = render(AdminLayout);
		expect(queryByRole('navigation', { name: 'Admin navigation' })).toBeNull();
		expect(queryByRole('button', { name: 'Logout' })).toBeNull();
		expect(getByRole('link', { name: 'Open app' })).toBeTruthy();
	});
});

describe('metrics menu bar', () => {
	it('contains month navigation and disables next month for the current month', async () => {
		const { getByRole, rerender } = render(MetricsPage, {
			data: {
				notification: null,
				metrics: buildDashboardMetrics(resolveMonthSelection('2026-06', now), [], [], now),
				metricsLoggingEnabled: true
			}
		});
		const controls = within(getByRole('region', { name: 'Metrics controls' }));
		expect(controls.getByRole('link', { name: 'Previous month' }).getAttribute('href')).toBe(
			'/admin?month=2026-05'
		);
		expect(controls.getByRole('link', { name: 'Next month' }).getAttribute('href')).toBe(
			'/admin?month=2026-07'
		);
		expect(
			controls.getByRole('button', { name: 'Metrics logging' }).getAttribute('aria-pressed')
		).toBe('true');

		await rerender({
			data: {
				notification: null,
				metrics: buildDashboardMetrics(resolveMonthSelection(null, now), [], [], now),
				metricsLoggingEnabled: false
			}
		});
		expect(controls.queryByRole('link', { name: 'Next month' })).toBeNull();
		expect(controls.getByLabelText('Next month unavailable')).toBeTruthy();
		expect(
			controls.getByRole('button', { name: 'Metrics logging' }).getAttribute('aria-pressed')
		).toBe('false');
	});

	it('preserves the logging action and gives immediate feedback while it submits', async () => {
		const { getByRole } = render(MetricsPage, {
			data: {
				notification: null,
				metrics: buildDashboardMetrics(resolveMonthSelection(null, now), [], [], now),
				metricsLoggingEnabled: true
			}
		});
		const button = getByRole('button', { name: 'Metrics logging' }) as HTMLButtonElement;
		const [formElement, submit] = vi.mocked(enhance).mock.calls[0];
		expect(formElement.getAttribute('action')).toBe('/admin?/setMetricsLogging');
		expect(new FormData(formElement).get('enabled')).toBe('false');
		const action = new URL('http://localhost/admin?/setMetricsLogging');
		const formData = new FormData(formElement);
		const callback = await submit!({
			formElement,
			formData,
			action,
			cancel: vi.fn(),
			controller: new AbortController(),
			submitter: button
		});
		await tick();
		expect(button.getAttribute('aria-pressed')).toBe('false');
		expect(button.disabled).toBe(true);
		if (typeof callback !== 'function') throw new Error('Expected a submission callback');
		const update = vi.fn();
		await callback({
			action,
			formData,
			formElement,
			result: { type: 'failure', status: 500 },
			update
		});
		await tick();
		expect(update).toHaveBeenCalled();
		expect(button.getAttribute('aria-pressed')).toBe('true');
		expect(button.disabled).toBe(false);
	});
});
