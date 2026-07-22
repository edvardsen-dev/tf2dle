import test, { expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
	if (testInfo.title === 'Timer resets after midnight') return;

	await page.goto('/');
});

test('Timer should be visible in footer', async ({ page }) => {
	const timer = page.getByTestId('timer');
	await expect(timer).toBeVisible();
});

test('Timer displays correct format', async ({ page }) => {
	const timer = page.getByTestId('timer');
	const timerText = await timer.textContent();
	const timerRegex = /^\d{2}:\d{2}:\d{2}$/;
	await expect(timerText).toMatch(timerRegex);
});

test('Timer updates every second', async ({ page }) => {
	const timer = page.getByTestId('timer');
	const initialTime = await timer.textContent();

	// Wait for 3 seconds
	await page.waitForTimeout(3000);

	const updatedTime = await timer.textContent();
	await expect(updatedTime).not.toBe(initialTime);
});

test('Timer resets after midnight', async ({ page }) => {
	await page.clock.install({ time: new Date('2025-01-01T23:59:58.000Z') });
	await page.goto('/');

	const timer = page.getByTestId('timer');
	await expect(timer).toBeVisible();
	await expect(timer).toHaveText(/^00:00:0[0-2]$/);

	await page.clock.runFor(3000);

	await expect(timer).toHaveText(/^23:59:5[6-9]$/);
});
