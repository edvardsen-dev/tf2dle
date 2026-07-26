import dayjs from '$lib/configs/dayjsConfig';
import {
	buildDashboardMetrics,
	getMonthBounds,
	normalizeAttemptNumber,
	resolveMonthSelection,
	type GameMode
} from '$lib/server/metricsUtils';
import { db } from '../prisma';

const ADMIN_SETTINGS_ID = 1;

class MetricsService {
	private constructor() {}

	public static async isMetricsLoggingEnabled() {
		const settings = await db.adminSettings.findUnique({
			where: {
				id: ADMIN_SETTINGS_ID
			},
			select: {
				metricsLoggingEnabled: true
			}
		});

		return settings?.metricsLoggingEnabled ?? true;
	}

	public static async setMetricsLoggingEnabled(enabled: boolean) {
		const settings = await db.adminSettings.upsert({
			where: {
				id: ADMIN_SETTINGS_ID
			},
			create: {
				id: ADMIN_SETTINGS_ID,
				metricsLoggingEnabled: enabled
			},
			update: {
				metricsLoggingEnabled: enabled
			},
			select: {
				metricsLoggingEnabled: true
			}
		});

		return settings.metricsLoggingEnabled;
	}

	public static async recordGameGuess(gameMode: GameMode, attempt: unknown, correct: boolean) {
		const attemptNumber = normalizeAttemptNumber(attempt);
		const date = dayjs.utc().startOf('day').toDate();

		try {
			if (!(await this.isMetricsLoggingEnabled())) return;

			await db.dailyGameModeMetrics.upsert({
				where: {
					date_gameMode: {
						date,
						gameMode
					}
				},
				create: {
					date,
					gameMode,
					starts: attemptNumber === 1 ? 1 : 0,
					guesses: 1,
					wins: correct ? 1 : 0,
					totalGuessesToWin: correct ? attemptNumber : 0
				},
				update: {
					starts: {
						increment: attemptNumber === 1 ? 1 : 0
					},
					guesses: {
						increment: 1
					},
					wins: {
						increment: correct ? 1 : 0
					},
					totalGuessesToWin: {
						increment: correct ? attemptNumber : 0
					}
				}
			});
		} catch (err) {
			console.error('Could not record game metrics', err);
		}
	}

	public static async recordPageView(path: string) {
		const date = dayjs.utc().startOf('day').toDate();

		try {
			if (!(await this.isMetricsLoggingEnabled())) return;

			await db.dailyPageMetrics.upsert({
				where: {
					date_path: {
						date,
						path
					}
				},
				create: {
					date,
					path,
					views: 1
				},
				update: {
					views: {
						increment: 1
					}
				}
			});
		} catch (err) {
			console.error('Could not record page metrics', err);
		}
	}

	public static async getDashboardMetrics(monthParam: string | null) {
		const selection = resolveMonthSelection(monthParam);
		const { start, end } = getMonthBounds(selection);
		const [gameRows, pageRows] = await Promise.all([
			db.dailyGameModeMetrics.findMany({
				where: {
					date: {
						gte: start,
						lt: end
					}
				},
				orderBy: [{ date: 'asc' }, { gameMode: 'asc' }]
			}),
			db.dailyPageMetrics.findMany({
				where: {
					date: {
						gte: start,
						lt: end
					}
				},
				orderBy: [{ date: 'asc' }, { path: 'asc' }]
			})
		]);

		return buildDashboardMetrics(selection, gameRows, pageRows);
	}
}

export default MetricsService;
