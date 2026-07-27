import dayjs from '$lib/configs/dayjsConfig';

export const GAME_MODES = ['weapon', 'weapon-2', 'map', 'cosmetic', 'unusual'] as const;

export type GameMode = (typeof GAME_MODES)[number];

export const GAME_MODE_LABELS: Record<GameMode, string> = {
	weapon: 'Weapon',
	'weapon-2': 'Weapon 2',
	map: 'Map',
	cosmetic: 'Cosmetic',
	unusual: 'Unusual'
};

export type GameMetricRow = {
	date: Date;
	gameMode: string;
	starts: number;
	guesses: number;
	wins: number;
	totalGuessesToWin: number;
};

export type PageMetricRow = {
	date: Date;
	path: string;
	views: number;
};

export type MonthSelection = {
	year: number;
	month: number;
	monthParam: string;
	label: string;
	previousMonthParam: string;
	nextMonthParam: string;
	isCurrentMonth: boolean;
};

export type DashboardMetrics = {
	month: MonthSelection;
	kpis: {
		starts: number;
		guesses: number;
		wins: number;
		solveRate: number;
		averageGuessesToWin: number;
		patchNotesViews: number;
	};
	daily: Array<{
		date: string;
		label: string;
		starts: number;
		guesses: number;
		wins: number;
		patchNotesViews: number;
	}>;
	dailyModes: Array<{
		date: string;
		label: string;
		modes: Array<{
			gameMode: GameMode;
			label: string;
			starts: number;
			guesses: number;
			wins: number;
		}>;
	}>;
	modes: Array<{
		gameMode: GameMode;
		label: string;
		starts: number;
		guesses: number;
		wins: number;
		solveRate: number;
		averageGuessesToWin: number;
	}>;
};

export function normalizeAttemptNumber(value: unknown) {
	const attemptNumber = Number(value);

	if (!Number.isInteger(attemptNumber) || attemptNumber < 1) return 1;

	return attemptNumber;
}

export function resolveMonthSelection(monthParam: string | null, now = dayjs.utc()) {
	const currentMonth = now.utc().startOf('month');
	const requestedMonth = parseMonthParam(monthParam);
	const selectedMonth =
		requestedMonth && requestedMonth.isBefore(currentMonth.add(1, 'month'))
			? requestedMonth
			: currentMonth;

	return {
		year: selectedMonth.year(),
		month: selectedMonth.month() + 1,
		monthParam: selectedMonth.format('YYYY-MM'),
		label: selectedMonth.format('MMMM YYYY'),
		previousMonthParam: selectedMonth.subtract(1, 'month').format('YYYY-MM'),
		nextMonthParam: selectedMonth.add(1, 'month').format('YYYY-MM'),
		isCurrentMonth: selectedMonth.isSame(currentMonth, 'month')
	} satisfies MonthSelection;
}

export function getMonthBounds(selection: Pick<MonthSelection, 'year' | 'month'>) {
	const start = dayjs
		.utc(`${selection.year}-${String(selection.month).padStart(2, '0')}-01`)
		.startOf('month');

	return {
		start: start.toDate(),
		end: start.add(1, 'month').toDate()
	};
}

export function buildDashboardMetrics(
	selection: MonthSelection,
	gameRows: GameMetricRow[],
	pageRows: PageMetricRow[],
	now = dayjs.utc()
) {
	const monthStart = dayjs.utc(`${selection.year}-${String(selection.month).padStart(2, '0')}-01`);
	const visibleDaysInMonth = selection.isCurrentMonth ? now.utc().date() : monthStart.daysInMonth();
	const daily = Array.from({ length: visibleDaysInMonth }, (_, index) => {
		const date = monthStart.add(index, 'day');

		return {
			date: date.format('YYYY-MM-DD'),
			label: date.format('D MMM'),
			starts: 0,
			guesses: 0,
			wins: 0,
			patchNotesViews: 0
		};
	});
	const dailyByDate = new Map(daily.map((day) => [day.date, day]));
	const dailyModes = daily.map((day) => ({
		date: day.date,
		label: day.label,
		modes: GAME_MODES.map((gameMode) => ({
			gameMode,
			label: GAME_MODE_LABELS[gameMode],
			starts: 0,
			guesses: 0,
			wins: 0
		}))
	}));
	const dailyModesByDate = new Map(dailyModes.map((day) => [day.date, day]));
	const modes = GAME_MODES.map((gameMode) => ({
		gameMode,
		label: GAME_MODE_LABELS[gameMode],
		starts: 0,
		guesses: 0,
		wins: 0,
		totalGuessesToWin: 0
	}));
	const modesByGameMode = new Map(modes.map((mode) => [mode.gameMode, mode]));

	for (const row of gameRows) {
		const dateKey = dayjs.utc(row.date).format('YYYY-MM-DD');
		const day = dailyByDate.get(dateKey);
		const dayMode = dailyModesByDate
			.get(dateKey)
			?.modes.find((mode) => mode.gameMode === row.gameMode);
		const mode = modesByGameMode.get(row.gameMode as GameMode);

		if (day) {
			day.starts += row.starts;
			day.guesses += row.guesses;
			day.wins += row.wins;
		}

		if (dayMode) {
			dayMode.starts += row.starts;
			dayMode.guesses += row.guesses;
			dayMode.wins += row.wins;
		}

		if (mode) {
			mode.starts += row.starts;
			mode.guesses += row.guesses;
			mode.wins += row.wins;
			mode.totalGuessesToWin += row.totalGuessesToWin;
		}
	}

	for (const row of pageRows) {
		if (row.path !== '/patch-notes') continue;

		const dateKey = dayjs.utc(row.date).format('YYYY-MM-DD');
		const day = dailyByDate.get(dateKey);

		if (day) {
			day.patchNotesViews += row.views;
		}
	}

	const totals = modes.reduce(
		(total, mode) => ({
			starts: total.starts + mode.starts,
			guesses: total.guesses + mode.guesses,
			wins: total.wins + mode.wins,
			totalGuessesToWin: total.totalGuessesToWin + mode.totalGuessesToWin
		}),
		{ starts: 0, guesses: 0, wins: 0, totalGuessesToWin: 0 }
	);
	const patchNotesViews = daily.reduce((total, day) => total + day.patchNotesViews, 0);

	return {
		month: selection,
		kpis: {
			starts: totals.starts,
			guesses: totals.guesses,
			wins: totals.wins,
			solveRate: rate(totals.wins, totals.starts),
			averageGuessesToWin: average(totals.totalGuessesToWin, totals.wins),
			patchNotesViews
		},
		daily,
		dailyModes,
		modes: modes.map(({ totalGuessesToWin, ...mode }) => ({
			...mode,
			solveRate: rate(mode.wins, mode.starts),
			averageGuessesToWin: average(totalGuessesToWin, mode.wins)
		}))
	} satisfies DashboardMetrics;
}

function parseMonthParam(value: string | null) {
	if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;

	const parsed = dayjs.utc(`${value}-01`);

	if (!parsed.isValid() || parsed.format('YYYY-MM') !== value) return null;

	return parsed.startOf('month');
}

function rate(numerator: number, denominator: number) {
	if (denominator === 0) return 0;

	return numerator / denominator;
}

function average(total: number, count: number) {
	if (count === 0) return 0;

	return total / count;
}
