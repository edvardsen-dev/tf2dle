import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotificationBanner from '../../src/lib/components/app-notification/NotificationBanner.svelte';
import { NotificationLevel } from '#lib/types.ts';
import AppNotification from '#lib/components/app-notification/AppNotification.svelte';

vi.mock('$app/env', () => ({ browser: true, dev: false, building: false }));

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe('NotificationBanner', () => {
	it.each([
		[NotificationLevel.INFO, 'Announcement', 'status'],
		[NotificationLevel.WARNING, 'Heads up', 'status'],
		[NotificationLevel.ERROR, 'Important notice', 'alert']
	])('renders the %s severity with an accessible message', (type, label, role) => {
		const { getByRole } = render(NotificationBanner, {
			type,
			content: 'The site may be temporarily unavailable.',
			onDismiss: vi.fn()
		});

		const message = getByRole(role);
		expect(message.textContent).toContain(label);
		expect(message.textContent).toContain('The site may be temporarily unavailable.');
	});

	it('calls the dismissal callback', async () => {
		const onDismiss = vi.fn();
		const { getByRole } = render(NotificationBanner, {
			type: NotificationLevel.INFO,
			content: 'An announcement.',
			onDismiss
		});

		await fireEvent.click(getByRole('button', { name: 'Dismiss notification' }));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it('updates the severity when the type changes', async () => {
		const { getByRole, rerender } = render(NotificationBanner, {
			type: NotificationLevel.INFO,
			content: 'An announcement.',
			onDismiss: vi.fn()
		});

		await rerender({ type: NotificationLevel.ERROR });
		expect(getByRole('alert').textContent).toContain('Important notice');
	});

	it('leaves width and centering to the caller', async () => {
		const { getByRole, rerender } = render(NotificationBanner, {
			type: NotificationLevel.INFO,
			content: 'An announcement.',
			onDismiss: vi.fn()
		});
		const banner = getByRole('status').parentElement!;
		expect(banner.className).not.toMatch(/max-w-|mx-auto/);

		await rerender({ class: 'mx-auto w-full max-w-[700px]' });
		expect(banner.className).toContain('mx-auto w-full max-w-[700px]');
	});
});

describe('AppNotification persistence', () => {
	const notification = {
		version: 2,
		type: NotificationLevel.INFO,
		content: 'Migration announcement'
	};

	it('persists dismissal and keeps the same version hidden after remounting', async () => {
		const { getByRole, unmount } = render(AppNotification, { notification });
		await fireEvent.click(getByRole('button', { name: 'Dismiss notification' }));
		expect(localStorage.getItem('app_notification')).toBe('{"version":2,"show":false}');
		unmount();
		const { queryByRole } = render(AppNotification, { notification });
		expect(queryByRole('status')).toBeNull();
		expect(queryByRole('button', { name: 'Dismiss notification' })).toBeNull();
	});

	it('shows a newer announcement after the previous version was dismissed', () => {
		localStorage.setItem('app_notification', '{"version":1,"show":false}');
		const { getByRole } = render(AppNotification, { notification });
		expect(getByRole('status').textContent).toContain('Migration announcement');
		expect(getByRole('button', { name: 'Dismiss notification' })).toBeTruthy();
		expect(localStorage.getItem('app_notification')).toBe('{"version":2,"show":true}');
	});
});
