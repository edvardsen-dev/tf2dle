import test from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('Timer should be visible in footer', async ({ page }) => {
	const timer = page.getByTestId('timer');
	await test.expect(timer).toBeVisible();
});

test('Timer displays correct format', async ({ page }) => {
	const timer = page.getByTestId('timer');
	const timerText = await timer.textContent();
	const timerRegex = /^\d{2}:\d{2}:\d{2}$/;
	await test.expect(timerText).toMatch(timerRegex);
});

test('Timer updates every second', async ({ page }) => {
	const timer = page.getByTestId('timer');
	const initialTime = await timer.textContent();

	// Wait for 3 seconds
	await page.waitForTimeout(3000);

	const updatedTime = await timer.textContent();
	await test.expect(updatedTime).not.toBe(initialTime);
});

// TODO: Implement this test
test('Timer resets at midnight UTC', async ({ page }) => {});
