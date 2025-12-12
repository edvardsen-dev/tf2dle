import { afterEach, beforeEach, describe, vi, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Footer from '../../src/lib/components/layouts/Footer.svelte';
import dayjs from '$lib/configs/dayjsConfig';

describe('Timer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// TODO: Fix me
	// it(
	// 	'should update timer every second',
	// 	() => {
	// 		const date = dayjs().utc().set('hour', 23).set('minutes', 59).set('seconds', 58).toDate();
	// 		vi.setSystemTime(date);
	//
	// 		const { getByTestId } = render(Footer);
	//
	// 		expect(getByTestId('timer').textContent).toContain('00:00:0');
	//
	// 		vi.advanceTimersByTime(3000);
	//
	// 		expect(getByTestId('timer').textContent).toContain('23:59:5');
	// 	},
	// 	{
	// 		timeout: 10000
	// 	}
	// );
});
