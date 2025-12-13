import test, { expect, type Page } from '@playwright/test';
import dayjs from 'dayjs';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => {
		window.localStorage.clear();
	});
});

test('Weapon page is accessible', async ({ page }) => {
	await page.goto('/');

	await page.getByTestId('weapon').click();
	await page.waitForNavigation();

	await expect(page.getByTestId('title')).toBeVisible();
});

test('Refresh button is shown when error occurs', async ({ page }) => {
	// Mock the API response
	await page.route('/api/v1/weapons', async (route) => {
		route.fulfill({ status: 500 });
	});

	await page.goto('/game-modes/weapon');

	await expect(page.getByTestId('refresh')).toBeVisible();
});

test('Can select a weapon', async ({ page }) => {
	await page.goto('/game-modes/weapon');

	const input = page.getByTestId('input');
	await expect(input).toBeVisible();

	await input.fill('scattergun');

	const dropdown = page.getByTestId('dropdown');
	await expect(dropdown).toBeVisible();

	const button = page.getByRole('button', { name: 'Scattergun' });
	await expect(button).toBeVisible();

	await button.click();
	await expect(page.getByAltText('Scattergun')).toBeVisible();
});

// test('Guesses are persisted on page navigation', async ({ page }) => {
// 	await page.goto('/game-modes/weapon');
//
// 	await page.getByTestId('input').fill('scattergun');
// 	await page.getByRole('button', { name: 'Scattergun' }).click();
//
// 	await page.goto('/');
//
// 	await page.goto('/game-modes/weapon');
//
// 	await expect(page.getByAltText('Scattergun')).toBeVisible();
// });

test('Dialog is shown when guess is correct', async ({ page }) => {
	await mockCorrectGuess(page);

	await page.goto('/game-modes/weapon');

	await page.getByTestId('input').fill('scattergun');
	await page.getByRole('button', { name: 'Scattergun' }).click();

	await expect(page.getByTestId('dialog')).toBeVisible();
});

test('Won state is persisted on page navigation', async ({ page }) => {
	await mockCorrectGuess(page);

	await page.goto('/game-modes/weapon');

	await page.getByTestId('input').fill('scattergun');
	await page.getByRole('button', { name: 'Scattergun' }).click();

	await page.waitForTimeout(3000);

	await page.goto('/');

	await page.goto('/game-modes/weapon');

	await expect(page.getByTestId('completed-message')).toBeVisible();
});

test('Toast is shown when guess fetch fails', async ({ page }) => {
	// Mock the API response
	await page.route('/api/v1/game-modes/weapon', async (route, request) => {
		// Only want to mock POST requests
		if (request.method() === 'POST') {
			route.fulfill({ status: 500 });
		} else {
			await route.continue();
		}
	});

	await page.goto('/game-modes/weapon');

	await page.getByTestId('input').fill('scattergun');
	await page.getByRole('button', { name: 'Scattergun' }).click();

	await expect(page.locator('.toast').first()).toBeVisible();
});

// TODO: Fix... fails cause it cant find the 'input' after new day
// test('Won state is reset when new day starts', async ({ page }) => {
// 	await mockCorrectGuess(page);
//
// 	const date = dayjs();
// 	await page.clock.setFixedTime(date.toDate());
//
// 	await page.goto('/game-modes/weapon');
//
// 	await page.getByTestId('input').fill('scattergun');
// 	await page.getByRole('button', { name: 'Scattergun' }).click();
//
// 	await page.waitForTimeout(8000);
//
// 	await page.goto('/');
//
// 	await page.clock.setFixedTime(date.add(1, 'day').add(10, 'minutes').toDate());
//
// 	await page.goto('/game-modes/weapon');
//
// 	await expect(page.getByTestId('input')).toBeVisible();
// 	await expect(page.getByTestId('guess-row-title')).not.toBeVisible();
// });

test('Guesses are reset when new day starts', async ({ page }) => {
	await mockCorrectGuess(page);

	await page.goto('/game-modes/weapon');

	await page.getByTestId('input').fill('shortstop');
	await page.getByRole('button', { name: 'Shortstop' }).click();

	await page.waitForTimeout(3000);

	await page.goto('/');

	await updateDate(page, 1);

	await page.goto('/game-modes/weapon');

	await expect(page.getByTestId('guess-row-title')).not.toBeVisible();
});

test('Can see how many have guessed correct', async ({ page }) => {
	await page.route('/api/v1/game-modes/weapon', async (route) => {
		return route.fulfill({
			status: 200,
			body: JSON.stringify(1337)
		});
	});

	await page.goto('/game-modes/weapon');

	await expect(page.getByTestId('number-of-correct-guesses')).toBeVisible();
});

test('Stats are empty on first visit', async ({ page }) => {
	await page.goto('/game-modes/weapon');

	const openStatsButton = page.getByTestId('openStatsDialog');

	await openStatsButton.click();

	await expect(page.getByTestId('statsDialog')).toBeVisible();
	await expect(page.getByTestId('noStatsMessage')).toBeVisible();
});

test('Stats are saved and displayed', async ({ page }) => {
	await page.goto('/game-modes/weapon');

	await page.getByTestId('input').fill('shortstop');
	await page.getByRole('button', { name: 'Shortstop' }).click();

	await page.waitForTimeout(3000);

	await mockCorrectGuess(page);

	await page.getByTestId('input').fill('scattergun');
	await page.getByRole('button', { name: 'Scattergun' }).click();

	await page.waitForTimeout(3000);

	await page.getByTestId('victoryClose').click();

	await page.getByTestId('openStatsDialog').click();

	await expect(page.getByTestId('statsDialog')).toBeVisible();
	expect(await page.locator('[data-pw="statsGraph"]').count()).toBe(2);
});

async function updateDate(page: Page, daysToAdd: number) {
	const overrideDate = (daysToAdd: number) => {
		const originalDate = Date;
		const NewDate = class extends originalDate {
			constructor(...args: any[]) {
				if (args.length === 0) {
					super(new originalDate().getTime() + daysToAdd * 86400000);
				} else if (args.length === 1) {
					super(args[0]);
				} else {
					super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
				}
			}
		};
		globalThis.Date = NewDate as any;
	};

	await page.addInitScript(overrideDate, daysToAdd);
}

async function mockCorrectGuess(page: Page) {
	await page.route('/api/v1/game-modes/weapon', async (route) => {
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				correct: true,
				name: 'Scattergun',
				releaseDate: {
					status: 'correct',
					value: 2007
				},
				usedBy: {
					status: 'correct',
					value: ['Scout']
				},
				slot: {
					status: 'correct',
					value: ['Primary']
				},
				magazineSize: {
					status: 'correct',
					value: '6'
				},
				qualities: {
					status: 'correct',
					value: ['Unique']
				}
			})
		});
	});
}
