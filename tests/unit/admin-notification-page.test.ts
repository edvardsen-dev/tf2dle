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

		const [formElement, submit] = vi
			.mocked(enhance)
			.mock.calls.find(([element]) => element.getAttribute('action') === '?/update')!;
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
		expect(getByText('Notification saved.').closest('[role="status"]')).not.toBeNull();

		vi.advanceTimersByTime(2000);
		await rerender({ form: { action: 'update', success: true } });
		vi.advanceTimersByTime(2000);
		await tick();
		expect(queryByText('Notification saved.')).not.toBeNull();

		vi.advanceTimersByTime(1000);
		await tick();
		expect(queryByText('Notification saved.')).toBeNull();

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

		expect(queryByText('Notification saved.')).toBeNull();
		expect(getByRole('alert').textContent).toContain('Could not save. Please try again.');
	});

	it('requires a non-empty message and disables visibility until the first save', async () => {
		const { getByRole, getByLabelText, getByText } = render(NotificationPage, {
			data: { notification: null },
			form: null
		});
		const save = getByRole('button', { name: 'Save notification' }) as HTMLButtonElement;
		expect(save.disabled).toBe(true);
		expect((getByRole('switch', { name: 'Enabled' }) as HTMLButtonElement).disabled).toBe(true);
		expect(getByText('Save a notification before enabling it.')).toBeTruthy();
		expect(getByLabelText('Content *').getAttribute('maxlength')).toBe('500');
		await fireEvent.input(getByLabelText('Content *'), { target: { value: '   ' } });
		expect(save.disabled).toBe(true);
		await fireEvent.input(getByLabelText('Content *'), { target: { value: 'Site announcement' } });
		expect(save.disabled).toBe(false);
	});

	it('blocks saving while enabled and allows saving the same edits after disabling', async () => {
		const notification = {
			id: 1,
			version: 1,
			type: NotificationLevel.INFO,
			content: 'Saved announcement',
			enabled: true
		};
		const { getByRole, getByLabelText, getByText, queryByText, rerender } = render(
			NotificationPage,
			{ data: { notification }, form: null }
		);
		const save = getByRole('button', { name: 'Save notification' }) as HTMLButtonElement;
		const message = 'Disable the notification before saving changes.';
		expect(save.disabled).toBe(true);
		expect(getByText(message).id).toBe(save.getAttribute('aria-describedby'));

		const content = getByLabelText('Content *') as HTMLTextAreaElement;
		await fireEvent.input(content, { target: { value: 'Unsaved edits' } });
		await fireEvent.change(getByLabelText('Type *'), {
			target: { value: NotificationLevel.WARNING }
		});
		expect(save.disabled).toBe(true);
		expect(getByText(message)).toBeTruthy();

		await rerender({ data: { notification: { ...notification, enabled: false } } });
		expect(save.disabled).toBe(false);
		expect(queryByText(message)).toBeNull();
		expect(content.value).toBe('Unsaved edits');
		expect((getByLabelText('Type *') as HTMLSelectElement).value).toBe(NotificationLevel.WARNING);
	});

	it('shows saving feedback and keeps edits after a network error', async () => {
		const { getByRole, getByLabelText } = render(NotificationPage, {
			data: { notification: null },
			form: null
		});
		await fireEvent.input(getByLabelText('Content *'), {
			target: { value: 'Unsaved announcement' }
		});
		const [formElement, submit] = vi
			.mocked(enhance)
			.mock.calls.find(([element]) => element.getAttribute('action') === '?/update')!;
		const action = new URL('http://localhost/admin/notification?/update');
		const formData = new FormData(formElement);
		const callback = await submit!({
			formElement,
			formData,
			action,
			cancel: vi.fn(),
			controller: new AbortController(),
			submitter: null
		});
		await tick();
		expect((getByRole('button', { name: 'Saving...' }) as HTMLButtonElement).disabled).toBe(true);
		if (typeof callback !== 'function') throw new Error('Expected a submission callback');
		const update = vi.fn();
		await callback({
			action,
			formData,
			formElement,
			result: { type: 'error', status: 500, error: { message: 'Internal error' } },
			update
		});
		await tick();
		expect(update).not.toHaveBeenCalled();
		expect(getByRole('alert').textContent).toContain(
			'Your edits are still here. Please try again.'
		);
		expect((getByLabelText('Content *') as HTMLTextAreaElement).value).toBe('Unsaved announcement');
		expect((getByRole('button', { name: 'Save notification' }) as HTMLButtonElement).disabled).toBe(
			false
		);
	});
});

describe('notification visibility', () => {
	it.each([false, true])(
		'updates immediately and confirms the saved setting, initially enabled: %s',
		async (initialEnabled) => {
			const notification = {
				id: 1,
				version: 1,
				type: NotificationLevel.INFO,
				content: 'Saved announcement',
				enabled: initialEnabled
			};
			const { getByRole, getByLabelText, rerender } = render(NotificationPage, {
				data: { notification },
				form: null
			});
			await fireEvent.input(getByLabelText('Content *'), { target: { value: 'Unsaved edits' } });
			const save = getByRole('button', { name: 'Save notification' }) as HTMLButtonElement;
			expect(save.disabled).toBe(initialEnabled);
			const toggle = getByRole('switch', { name: 'Enabled' }) as HTMLButtonElement;
			const [formElement, submit] = vi
				.mocked(enhance)
				.mock.calls.find(([element]) => element.getAttribute('action') === '?/setActiveState')!;
			const action = new URL('http://localhost/admin/notification?/setActiveState');
			const formData = new FormData(formElement);
			expect(formData.get('enabled')).toBe(String(!initialEnabled));
			const callback = await submit!({
				formElement,
				formData,
				action,
				cancel: vi.fn(),
				controller: new AbortController(),
				submitter: toggle
			});
			await tick();
			expect(toggle.getAttribute('aria-checked')).toBe(String(!initialEnabled));
			expect(toggle.disabled).toBe(true);
			expect(save.disabled).toBe(true);
			expect(toggle.classList.contains('transition-colors')).toBe(true);
			expect(toggle.firstElementChild?.classList.contains('transition-transform')).toBe(true);
			if (typeof callback !== 'function') throw new Error('Expected a submission callback');
			const update = vi.fn(async () => {
				await rerender({
					data: { notification: { ...notification, enabled: !initialEnabled } },
					form: { action: 'setActiveState', success: true }
				});
			});
			await callback({
				action,
				formData,
				formElement,
				result: { type: 'success', status: 200, data: { action: 'setActiveState', success: true } },
				update
			});
			await tick();
			expect(update).toHaveBeenCalledWith({ reset: false });
			expect(toggle.getAttribute('aria-checked')).toBe(String(!initialEnabled));
			expect(toggle.disabled).toBe(false);
			expect(save.disabled).toBe(!initialEnabled);
			expect((getByLabelText('Content *') as HTMLTextAreaElement).value).toBe('Unsaved edits');
		}
	);

	it.each(['failure', 'error'] as const)(
		'restores the previous setting with an inline error on %s',
		async (resultType) => {
			const notification = {
				id: 1,
				version: 1,
				type: NotificationLevel.INFO,
				content: 'Saved announcement',
				enabled: false
			};
			const { getByRole, getByLabelText, rerender } = render(NotificationPage, {
				data: { notification },
				form: null
			});
			await fireEvent.input(getByLabelText('Content *'), { target: { value: 'Unsaved edits' } });
			const toggle = getByRole('switch', { name: 'Enabled' }) as HTMLButtonElement;
			const [formElement, submit] = vi
				.mocked(enhance)
				.mock.calls.find(([element]) => element.getAttribute('action') === '?/setActiveState')!;
			const action = new URL('http://localhost/admin/notification?/setActiveState');
			const formData = new FormData(formElement);
			const callback = await submit!({
				formElement,
				formData,
				action,
				cancel: vi.fn(),
				controller: new AbortController(),
				submitter: toggle
			});
			await tick();
			expect(toggle.getAttribute('aria-checked')).toBe('true');
			if (typeof callback !== 'function') throw new Error('Expected a submission callback');
			const message =
				'Could not change visibility. The previous setting was restored. Please try again.';
			const update = vi.fn(async () => {
				await rerender({ form: { action: 'setActiveState', message } });
			});
			await callback({
				action,
				formData,
				formElement,
				result:
					resultType === 'error'
						? { type: 'error', status: 500, error: { message: 'Internal error' } }
						: { type: 'failure', status: 500, data: { action: 'setActiveState', message } },
				update
			});
			await tick();
			expect(toggle.getAttribute('aria-checked')).toBe('false');
			expect(toggle.disabled).toBe(false);
			expect(getByRole('alert').textContent).toContain(message);
			expect((getByLabelText('Content *') as HTMLTextAreaElement).value).toBe('Unsaved edits');
		}
	);
});
