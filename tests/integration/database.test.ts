import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '#lib/server/generated/prisma/client.ts';
import type { AdminSettings } from '#lib/server/generated/prisma/browser.ts';

test.describe('Real database API regressions', () => {
	test.describe.configure({ mode: 'serial' });

	let db: PrismaClient;
	let originalSettings: AdminSettings | null | undefined;
	let today: Date;
	let yesterday: Date;
	const gameModes = ['weapon', 'weapon-2'];
	const path = '/patch-notes';

	test.beforeAll(async () => {
		const databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) throw new Error('DATABASE_URL must point to the dedicated test database');
		const url = new URL(databaseUrl);
		if (
			!['postgres:', 'postgresql:'].includes(url.protocol) ||
			url.username !== 'tf2dle_test' ||
			url.pathname !== '/tf2dle_migration_test' ||
			!['localhost', '127.0.0.1'].includes(url.hostname) ||
			!['5432', '55432'].includes(url.port)
		) {
			throw new Error('Refusing to mutate a database outside the dedicated local/CI test database');
		}
		db = new PrismaClient({
			adapter: new PrismaPg({
				connectionString: databaseUrl,
				max: 10,
				connectionTimeoutMillis: 10_000,
				idleTimeoutMillis: 300_000
			})
		});
		originalSettings = await db.adminSettings.findUnique({ where: { id: 1 } });
	});

	test.beforeEach(async () => {
		today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
		yesterday = new Date(today.getTime() - 86400000);
		await cleanup();
		await db.adminSettings.upsert({
			where: { id: 1 },
			create: { id: 1, metricsLoggingEnabled: true },
			update: { metricsLoggingEnabled: true }
		});
		// Non-midnight inputs must round-trip as SQL dates and match API lookups at the current time.
		const selectedToday = new Date(today.getTime() + 15 * 3600000 + 12345);
		const selectedYesterday = new Date(yesterday.getTime() + 23 * 3600000 + 54321);
		await db.$transaction([
			db.dailyWeapons.createMany({
				data: [
					{ selectedAt: selectedToday, name: 'Scattergun', hasWon: 7 },
					{ selectedAt: selectedYesterday, name: 'Rocket Launcher', hasWon: 11 }
				]
			}),
			db.dailyWeaponsTwo.createMany({
				data: [
					{ selectedAt: selectedToday, name: 'Shortstop', hasWon: 7 },
					{ selectedAt: selectedYesterday, name: 'Force-A-Nature', hasWon: 11 }
				]
			}),
			db.dailyGameModeMetrics.createMany({
				data: gameModes.map((gameMode) => ({
					date: yesterday,
					gameMode,
					starts: 3,
					guesses: 8,
					wins: 2,
					totalGuessesToWin: 6
				}))
			}),
			db.dailyPageMetrics.create({ data: { date: yesterday, path, views: 9 } })
		]);
	});

	test.afterEach(async () => {
		if (!db) return;
		try {
			if (today) await cleanup();
		} finally {
			if (originalSettings) {
				await db.adminSettings.upsert({
					where: { id: 1 },
					create: originalSettings,
					update: originalSettings
				});
			} else if (originalSettings === null) {
				await db.adminSettings.deleteMany({ where: { id: 1 } });
			}
		}
	});

	test.afterAll(async () => {
		await db?.$disconnect();
	});

	for (const gameMode of gameModes) {
		test(`${gameMode} reuses daily selections and persists wins and compound-key metrics`, async ({
			request
		}) => {
			const endpoint = `/api/v1/game-modes/${gameMode}`;
			const correctGuess = gameMode === 'weapon' ? 'Scattergun' : 'Shortstop';
			const wrongGuess = gameMode === 'weapon' ? 'Shortstop' : 'Scattergun';
			const yesterdayAnswer = gameMode === 'weapon' ? 'Rocket Launcher' : 'Force-A-Nature';
			const readSelections = () =>
				gameMode === 'weapon'
					? db.dailyWeapons.findMany({
							where: { selectedAt: { in: [today, yesterday] } },
							orderBy: { selectedAt: 'asc' }
						})
					: db.dailyWeaponsTwo.findMany({
							where: { selectedAt: { in: [today, yesterday] } },
							orderBy: { selectedAt: 'asc' }
						});
			const seeded = await readSelections();
			expect(seeded).toHaveLength(2);
			expect(seeded[0]).toMatchObject({ selectedAt: yesterday, name: yesterdayAnswer, hasWon: 11 });
			expect(seeded[1]).toMatchObject({ selectedAt: today, name: correctGuess, hasWon: 7 });

			for (let i = 0; i < 2; i++) {
				const response = await request.get(endpoint);
				expect(response.status()).toBe(200);
				if (gameMode === 'weapon') {
					expect(await response.json()).toBe(7);
				} else {
					expect(await response.json()).toEqual({
						weapon: {
							numberOfTotalAttributes: 5,
							attributes: [{ text: 'When weapon is active:', variant: 'neutral' }]
						},
						numberOfCorrectGuesses: 7
					});
				}
				const previous = await request.get(`${endpoint}/yesterday`);
				expect(previous.status()).toBe(200);
				expect(await previous.json()).toBe(yesterdayAnswer);
			}
			expect(await readSelections()).toEqual(seeded);

			const wrong = await request.post(endpoint, {
				data: { guess: wrongGuess, numberOfGuesses: 1 }
			});
			expect(wrong.status()).toBe(200);
			expect(await wrong.json()).toMatchObject({ name: wrongGuess, correct: false });
			expect(await readSelections()).toEqual(seeded);
			const key = { date_gameMode: { date: today, gameMode } };
			const firstMetric = await db.dailyGameModeMetrics.findUnique({ where: key });
			expect(firstMetric).toMatchObject({
				date: today,
				gameMode,
				starts: 1,
				guesses: 1,
				wins: 0,
				totalGuessesToWin: 0
			});

			const correct = await request.post(endpoint, {
				data: { guess: correctGuess, numberOfGuesses: 2 }
			});
			expect(correct.status()).toBe(200);
			expect(await correct.json()).toMatchObject({ name: correctGuess, correct: true });
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 8 }]);
			const metric = await db.dailyGameModeMetrics.findUnique({ where: key });
			expect(metric).toEqual({ ...firstMetric, guesses: 2, wins: 1, totalGuessesToWin: 2 });
			expect(await db.dailyGameModeMetrics.count({ where: { date: today, gameMode } })).toBe(1);
			expect(
				await db.dailyGameModeMetrics.findUnique({
					where: { date_gameMode: { date: yesterday, gameMode } }
				})
			).toMatchObject({ starts: 3, guesses: 8, wins: 2, totalGuessesToWin: 6 });

			await db.adminSettings.update({ where: { id: 1 }, data: { metricsLoggingEnabled: false } });
			const unloggedWin = await request.post(endpoint, {
				data: { guess: correctGuess, numberOfGuesses: 3 }
			});
			expect(unloggedWin.status()).toBe(200);
			expect(await unloggedWin.json()).toMatchObject({ correct: true });
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 9 }]);
			expect(await db.dailyGameModeMetrics.findUnique({ where: key })).toEqual(metric);
			await db.dailyGameModeMetrics.delete({ where: key });
			const unloggedGuess = await request.post(endpoint, {
				data: { guess: wrongGuess, numberOfGuesses: 1 }
			});
			expect(unloggedGuess.status()).toBe(200);
			expect(await unloggedGuess.json()).toMatchObject({ correct: false });
			expect(await db.dailyGameModeMetrics.findUnique({ where: key })).toBeNull();
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 9 }]);
		});
	}

	test('Page views reuse the date/path key and stop creating or updating metrics when disabled', async ({
		request
	}) => {
		const key = { date_path: { date: today, path } };
		expect((await request.get(path)).status()).toBe(200);
		const firstMetric = await db.dailyPageMetrics.findUnique({ where: key });
		expect(firstMetric).toMatchObject({ date: today, path, views: 1 });
		expect((await request.get(path)).status()).toBe(200);
		const metric = await db.dailyPageMetrics.findUnique({ where: key });
		expect(metric).toEqual({ ...firstMetric, views: 2 });
		expect(await db.dailyPageMetrics.count({ where: { date: today, path } })).toBe(1);
		expect(
			await db.dailyPageMetrics.findUnique({ where: { date_path: { date: yesterday, path } } })
		).toMatchObject({ views: 9 });

		await db.adminSettings.update({ where: { id: 1 }, data: { metricsLoggingEnabled: false } });
		expect((await request.get(path)).status()).toBe(200);
		expect(await db.dailyPageMetrics.findUnique({ where: key })).toEqual(metric);
		await db.dailyPageMetrics.delete({ where: key });
		expect((await request.get(path)).status()).toBe(200);
		expect(await db.dailyPageMetrics.findUnique({ where: key })).toBeNull();
	});

	async function cleanup() {
		await db.$transaction([
			db.dailyWeapons.deleteMany({ where: { selectedAt: { in: [today, yesterday] } } }),
			db.dailyWeaponsTwo.deleteMany({ where: { selectedAt: { in: [today, yesterday] } } }),
			db.dailyGameModeMetrics.deleteMany({
				where: { date: { in: [today, yesterday] }, gameMode: { in: gameModes } }
			}),
			db.dailyPageMetrics.deleteMany({ where: { date: { in: [today, yesterday] }, path } })
		]);
	}
});
