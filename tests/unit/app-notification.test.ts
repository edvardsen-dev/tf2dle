import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppNotificationUI from '../../src/lib/components/app-notification/AppNotificationUI.svelte';
import { NotificationLevel } from '../../src/lib/components/app-notification';

afterEach(cleanup);

describe('AppNotificationUI', () => {
	it.each([
		[NotificationLevel.INFO, 'Announcement', 'status'],
		[NotificationLevel.WARNING, 'Heads up', 'status'],
		[NotificationLevel.ERROR, 'Important notice', 'alert']
	])('renders the %s severity with an accessible message', (type, label, role) => {
		const { getByRole } = render(AppNotificationUI, {
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
		const { getByRole } = render(AppNotificationUI, {
			type: NotificationLevel.INFO,
			content: 'An announcement.',
			onDismiss
		});

		await fireEvent.click(getByRole('button', { name: 'Dismiss notification' }));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it('updates the severity when the type changes', async () => {
		const { getByRole, rerender } = render(AppNotificationUI, {
			type: NotificationLevel.INFO,
			content: 'An announcement.',
			onDismiss: vi.fn()
		});

		await rerender({ type: NotificationLevel.ERROR });
		expect(getByRole('alert').textContent).toContain('Important notice');
	});
});
