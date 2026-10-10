import test, { expect, type Page } from '@playwright/test';
import type {
	CosmeticGuessResponse,
	CurrentCosmeticDto,
	CurrentUnusualDto,
	MapGuessResponse,
	SelectedMapDto,
	UnusualGuessResponse,
	WeaponTwoGuessResponse,
	WeaponTwoResponse
} from '#lib/dtos.ts';

const guessedAt = '2026-10-10T12:00:00.000Z';
const modes = [
	{
		mode: 'weapon-2',
		storage: 'weapon_2',
		title: 'Weapon 2',
		name: 'Scattergun',
		list: 'weapons',
		items: ['Scattergun'],
		today: {
			weapon: {
				numberOfTotalAttributes: 1,
				attributes: [{ text: 'Test weapon clue', variant: 'positive' }]
			},
			numberOfCorrectGuesses: 7
		} satisfies WeaponTwoResponse,
		guess: {
			name: 'Scattergun',
			correct: true,
			guessedAt,
			attributes: [{ text: 'Test weapon clue', variant: 'positive' }]
		} satisfies WeaponTwoGuessResponse
	},
	{
		mode: 'map',
		storage: 'map',
		title: 'Map',
		name: 'Badlands',
		list: 'maps',
		items: [{ name: 'Badlands', thumbnail: 'test-map' }],
		today: {
			image: { url: 'test-map', startingPos: { x: 50, y: 50 } },
			correctGuesses: 7
		} satisfies SelectedMapDto,
		guess: {
			correct: true,
			guessedAt,
			thumbnail: 'test-map',
			name: { status: 'correct', value: 'Badlands' },
			gameModes: { status: 'correct', value: ['Control Point'] },
			releaseDate: { status: 'correct', value: 2008 }
		} satisfies MapGuessResponse
	},
	{
		mode: 'cosmetic',
		storage: 'cosmetic',
		title: 'Cosmetic',
		name: 'Team Captain',
		list: 'cosmetics',
		items: [{ name: 'Team Captain', thumbnail: 'test-cosmetic' }],
		today: {
			cosmetic: { thumbnail: 'test-cosmetic', rotation: 0 },
			numbersOfCorrectGuesses: 7
		} satisfies CurrentCosmeticDto,
		guess: {
			name: 'Team Captain',
			thumbnail: 'test-cosmetic',
			correct: true,
			guessedAt,
			usedBy: 'All classes'
		} satisfies CosmeticGuessResponse
	},
	{
		mode: 'unusual',
		storage: 'unusual',
		title: 'Unusuals',
		name: 'Burning Flames',
		list: 'unusuals',
		items: [{ name: 'Burning Flames', thumbnail: 'test-unusual' }],
		today: {
			unusual: { thumbnail: 'test-unusual', rotation: 0 },
			numberOfCorrectGuesses: 7
		} satisfies CurrentUnusualDto,
		guess: {
			name: 'Burning Flames',
			thumbnail: 'test-unusual',
			correct: true,
			guessedAt,
			series: 'Original'
		} satisfies UnusualGuessResponse
	}
];

async function mockMode(page: Page, fixture: (typeof modes)[number], failure?: 'load' | 'guess') {
	await page.clock.install({ time: new Date(guessedAt) });
	await page.clock.setFixedTime(new Date(guessedAt));
	await page.route(`**/api/v1/${fixture.list}`, (route) => route.fulfill({ json: fixture.items }));
	await page.route(`**/api/v1/game-modes/${fixture.mode}/yesterday`, (route) =>
		route.fulfill({ json: 'Yesterday test answer' })
	);
	await page.route(`**/api/v1/game-modes/${fixture.mode}`, (route) => {
		const isGuess = route.request().method() === 'POST';
		if ((failure === 'load' && !isGuess) || (failure === 'guess' && isGuess)) {
			return route.fulfill({ status: 500, json: { message: 'Deterministic API failure' } });
		}
		return route.fulfill({ json: isGuess ? fixture.guess : fixture.today });
	});
	// Client navigation makes universal-load fetches interceptable instead of using SSR's database.
	await page.goto('/');
	await page.locator(`a[href="/game-modes/${fixture.mode}"]`).click();
}

for (const fixture of modes) {
	test(`${fixture.mode} renders and accepts a keyboard guess, then persists the win`, async ({
		page
	}) => {
		await mockMode(page, fixture);
		await expect(page.getByRole('heading', { name: fixture.title, exact: true })).toBeVisible();
		const input = page.getByRole('combobox', { name: 'Enter your guess' });
		await expect(input).toBeVisible();
		await input.fill(fixture.name);
		await expect(page.getByRole('option', { name: fixture.name })).toHaveAttribute(
			'aria-selected',
			'true'
		);
		const request = page.waitForRequest(
			(request) =>
				request.method() === 'POST' && request.url().endsWith(`/api/v1/game-modes/${fixture.mode}`)
		);
		await input.press('Enter');
		expect((await request).postDataJSON()).toEqual({ guess: fixture.name, numberOfGuesses: 1 });
		await expect(page.getByTestId('dialog')).toBeVisible();
		await expect(page.getByTestId('dialog').getByText(fixture.name, { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(page.getByTestId('completed-message')).toBeVisible();
		await expect(page.getByTestId('share-result')).toBeVisible();
		expect(
			await page.evaluate((key) => localStorage.getItem(key), `${fixture.storage}_stats`)
		).toBe('[1]');
		await page.getByRole('link', { name: 'logo', exact: true }).click();
		const link = page.locator(`a[href="/game-modes/${fixture.mode}"]`);
		await expect(link).toContainText('Solved in 1');
		await link.click();
		await expect(page.getByTestId('completed-message')).toBeVisible();
		await expect(input).toHaveCount(0);
	});

	test(`${fixture.mode} reports a failed guess without recording a win and allows retry`, async ({
		page
	}) => {
		await mockMode(page, fixture, 'guess');
		const input = page.getByRole('combobox', { name: 'Enter your guess' });
		await input.fill(fixture.name);
		await input.press('Enter');
		await expect(page.getByText(/Could not validate your guess, please try again/)).toBeVisible();
		await expect(input).toHaveAttribute('aria-busy', 'false');
		await expect(page.getByTestId('completed-message')).toHaveCount(0);
		expect(
			await page.evaluate((key) => localStorage.getItem(key), `${fixture.storage}_guesses`)
		).toBe('[]');
		expect(
			await page.evaluate((key) => localStorage.getItem(key), `${fixture.storage}_stats`)
		).toBeNull();
		await page.route(`**/api/v1/game-modes/${fixture.mode}`, (route) =>
			route.fulfill({ json: fixture.guess })
		);
		// Advance the input's double-submit guard before retrying a fast mocked response.
		await page.clock.runFor(150);
		await input.fill(fixture.name);
		await input.press('Enter');
		await expect(page.getByTestId('dialog')).toBeVisible();
		expect(
			await page.evaluate((key) => localStorage.getItem(key), `${fixture.storage}_stats`)
		).toBe('[1]');
	});

	test(`${fixture.mode} presents its load error with a recovery link`, async ({ page }) => {
		await mockMode(page, fixture, 'load');
		if (fixture.mode === 'unusual') {
			await expect(page.getByRole('heading', { name: 'Error 500', exact: true })).toBeVisible();
			await expect(
				page.getByText('Something went wrong. Please refresh the page.', { exact: true })
			).toBeVisible();
			await page.getByRole('link', { name: 'Abort!', exact: true }).click();
			await expect(page).toHaveURL('/');
			await expect(page.getByRole('heading', { name: 'Game modes', exact: true })).toBeVisible();
		} else {
			const refresh = page.getByTestId('refresh');
			await expect(refresh).toBeVisible();
			await expect(refresh).toHaveAttribute('href', `/game-modes/${fixture.mode}`);
			await expect(refresh).toContainText(/Something went wrong/);
		}
		await expect(page.getByRole('combobox')).toHaveCount(0);
	});
}

test('Navigation to a missing route renders 404 and Abort returns to the app', async ({ page }) => {
	await page.goto('/patch-notes');
	await page.evaluate(() => {
		const link = document.createElement('a');
		link.href = '/migration-test-missing-route';
		link.textContent = 'Visit missing route';
		document.body.append(link);
	});
	await page.getByRole('link', { name: 'Visit missing route', exact: true }).click();
	await expect(page).toHaveURL('/migration-test-missing-route');
	await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
	await expect(page.getByText('Not found', { exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Abort!', exact: true }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('heading', { name: 'Game modes', exact: true })).toBeVisible();
});
