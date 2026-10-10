import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorPage from '../../src/routes/+error.svelte';
import { setPage } from '../page-state.svelte.ts';

vi.mock('$app/state', () => import('../page-state.svelte.ts'));
vi.mock('$app/env', () => ({ browser: true, dev: false, building: false }));

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe('error page state', () => {
	it('reacts to navigation errors and clears the previous message for a 404', async () => {
		setPage({ status: 500, error: { status: 500, message: 'Could not load the challenge.' } });
		const { getByRole, getByText, queryByText } = render(ErrorPage);
		expect(getByRole('heading', { name: 'Error 500' })).toBeTruthy();
		expect(getByText('Could not load the challenge.', { exact: true })).toBeTruthy();
		expect(getByRole('link', { name: 'Abort!' }).getAttribute('href')).toBe('/');

		setPage({ status: 404, error: { status: 404, message: 'Internal route detail' } });
		await tick();
		expect(getByRole('heading', { name: '404' })).toBeTruthy();
		expect(getByText('Not found', { exact: true })).toBeTruthy();
		expect(queryByText('Could not load the challenge.', { exact: true })).toBeNull();
		expect(queryByText('Internal route detail', { exact: true })).toBeNull();
	});

	it('shows the fallback when the next error has no body', async () => {
		setPage({ status: 404, error: null });
		const { getByRole, getByText, queryByText } = render(ErrorPage);
		setPage({ status: 503, error: null });
		await tick();
		expect(getByRole('heading', { name: 'Error 503' })).toBeTruthy();
		expect(getByText('An unexpected error occurred.', { exact: true })).toBeTruthy();
		expect(queryByText('Not found', { exact: true })).toBeNull();
	});
});
