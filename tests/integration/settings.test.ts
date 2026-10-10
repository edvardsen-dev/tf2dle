import test, { expect } from '@playwright/test';

test('Settings supports Escape and keyboard toggles and persists the timer preference', async ({
	page
}) => {
	await page.goto('/');
	const timer = page.getByTestId('timer');
	await expect(timer).toBeVisible();
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(trigger).toBeFocused();

	await trigger.press('Enter');
	await expect(dialog).toBeVisible();
	const toggle = dialog.getByRole('switch', { name: 'Hide reset timer', exact: true });
	await expect(toggle).not.toBeChecked();
	await toggle.focus();
	await toggle.press('Space');
	await expect(toggle).toBeChecked();
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem('hide_reset_timer')))
		.toBe('true');
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(timer).not.toBeVisible();

	await page.reload();
	await expect(timer).not.toBeVisible();
	await trigger.click();
	await expect(dialog).toBeVisible();
	await expect(toggle).toBeChecked();
	await toggle.focus();
	await toggle.press('Space');
	await expect(toggle).not.toBeChecked();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(timer).toBeVisible();
	await page.reload();
	await expect(timer).toBeVisible();
});

test('Cancelling a mode reset preserves stats; confirming clears only that mode', async ({
	page
}) => {
	await page.addInitScript(() => {
		for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
			localStorage.setItem(`${mode}_stats`, '[2,1]');
		}
	});
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings', exact: true }).click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	const clear = settings.getByRole('button', { name: 'Clear', exact: true }).first();
	// The Bits child snippet must produce one focusable button, not a nested trigger.
	await expect(clear.locator('button')).toHaveCount(0);
	await clear.focus();
	await clear.press('Enter');
	const confirmation = page.getByRole('alertdialog', { name: 'Clear weapon stats', exact: true });
	await expect(confirmation).toBeVisible();
	const cancel = confirmation.getByRole('button', { name: 'Cancel', exact: true });
	await expect(cancel).toBeFocused();
	await cancel.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(clear).toBeFocused();
	expect(await page.evaluate(() => localStorage.getItem('weapon_stats'))).toBe('[2,1]');
	await expect(
		page.getByText('Stats related to the weapon game mode have been deleted!')
	).toHaveCount(0);

	await clear.press('Space');
	await expect(confirmation).toBeVisible();
	await expect(cancel).toBeFocused();
	await cancel.press('Tab');
	const confirm = confirmation.getByRole('button', { name: 'Clear stats', exact: true });
	await expect(confirm).toBeFocused();
	await confirm.press('Tab');
	await expect(cancel).toBeFocused();
	await cancel.press('Tab');
	await confirm.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(settings).toBeVisible();
	await expect(clear).toBeFocused();
	await expect(
		page.getByText('Stats related to the weapon game mode have been deleted!', { exact: true })
	).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('weapon_stats'))).toBeNull();
	for (const mode of ['weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBe('[2,1]');
	}
});

test('Clear all stats requires confirmation and preserves gameplay and preferences', async ({
	page
}) => {
	await page.addInitScript(() => {
		for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
			localStorage.setItem(`${mode}_stats`, '[1]');
		}
		localStorage.setItem('weapon_guesses', '[{"name":"Scattergun","correct":false}]');
		localStorage.setItem('hide_reset_timer', 'true');
	});
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings', exact: true }).click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	const trigger = settings.getByRole('button', { name: 'Clear all stats', exact: true });
	await trigger.focus();
	await trigger.press('Enter');
	const confirmation = page.getByRole('alertdialog', { name: 'Clear stats', exact: true });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Cancel', exact: true }).press('Enter');
	await expect(trigger).toBeFocused();
	for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBe('[1]');
	}
	await trigger.press('Enter');
	const confirm = confirmation.getByRole('button', { name: 'Clear all', exact: true });
	await confirm.focus();
	await confirm.press('Enter');
	await expect(confirmation).not.toBeVisible();
	await expect(trigger).toBeFocused();
	await expect(page.getByText('All stats have been deleted!', { exact: true })).toBeVisible();
	for (const mode of ['weapon', 'weapon_2', 'map', 'cosmetic', 'unusual']) {
		expect(await page.evaluate((key) => localStorage.getItem(key), `${mode}_stats`)).toBeNull();
	}
	expect(await page.evaluate(() => localStorage.getItem('weapon_guesses'))).toBe(
		'[{"name":"Scattergun","correct":false}]'
	);
	expect(await page.evaluate(() => localStorage.getItem('hide_reset_timer'))).toBe('true');
});

test('Mobile settings keeps lower controls reachable and restores trigger focus', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 667 });
	await page.goto('/');
	const trigger = page.getByRole('button', { name: 'Settings', exact: true });
	await trigger.click();
	const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
	await expect(settings).toBeVisible();
	const clear = settings.getByRole('button', { name: 'Clear all stats', exact: true });
	await clear.scrollIntoViewIfNeeded();
	await expect(clear).toBeInViewport();
	await clear.click();
	const confirmation = page.getByRole('alertdialog', { name: 'Clear stats', exact: true });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(clear).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(settings).not.toBeVisible();
	await expect(trigger).toBeFocused();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
