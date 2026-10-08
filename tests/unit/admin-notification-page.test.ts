import { enhance } from '$app/forms';
import { NotificationLevel } from '$lib/types';
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotificationPage from '../../src/routes/admin/notification/+page.svelte';

vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => ({ destroy: vi.fn() }))
}));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe('admin notification form', () => {
	it('keeps the edited fields when applying a successful save', async () => {
		const { getByLabelText } = render(NotificationPage, {
			data: { notification: null },
			form: null
		});
		const content = getByLabelText('Content *') as HTMLTextAreaElement;
		const type = getByLabelText('Type *') as HTMLSelectElement;
		await fireEvent.input(content, { target: { value: 'Updated notification' } });
		await fireEvent.change(type, { target: { value: NotificationLevel.WARNING } });

		const [formElement, submit] = vi.mocked(enhance).mock.calls[0];
		const callback = await submit!({
			formElement,
			formData: new FormData(formElement),
			action: new URL('http://localhost/admin/notification?/update'),
			cancel: vi.fn(),
			controller: new AbortController(),
			submitter: null
		});
		const update = vi.fn();
		if (typeof callback !== 'function') throw new Error('Expected a submission callback');
		await callback({
			action: new URL('http://localhost/admin/notification?/update'),
			formData: new FormData(formElement),
			formElement,
			result: { type: 'success', status: 200, data: { action: 'update', success: true } },
			update
		});

		expect(update).toHaveBeenCalledWith({ reset: false });
		expect(content.value).toBe('Updated notification');
		expect(type.value).toBe(NotificationLevel.WARNING);
	});

	it('dismisses success after three seconds and restarts the delay for another save', async () => {
		vi.useFakeTimers();
		const { getByText, queryByText, rerender, unmount } = render(NotificationPage, {
			data: { notification: null },
			form: { action: 'update', success: true }
		});
		expect(getByText('App notification updated!').getAttribute('role')).toBe('status');

		vi.advanceTimersByTime(2000);
		await rerender({ form: { action: 'update', success: true } });
		vi.advanceTimersByTime(2000);
		await tick();
		expect(queryByText('App notification updated!')).not.toBeNull();

		vi.advanceTimersByTime(1000);
		await tick();
		expect(queryByText('App notification updated!')).toBeNull();

		await rerender({ form: { action: 'update', success: true } });
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});

	it('leaves save errors visible and hides any previous success message', async () => {
		vi.useFakeTimers();
		const { getByRole, queryByText, rerender } = render(NotificationPage, {
			data: { notification: null },
			form: { action: 'update', success: true }
		});
		await rerender({ form: { action: 'update', message: 'Could not save. Please try again.' } });
		vi.advanceTimersByTime(5000);
		await tick();

		expect(queryByText('App notification updated!')).toBeNull();
		expect(getByRole('alert').textContent).toContain('Could not save. Please try again.');
	});
});
