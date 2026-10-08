<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js';
	import * as Card from '$lib/components/ui/card';
	import AdminLogs from './AdminLogs.svelte';
	import KpiCard from './KpiCard.svelte';

	export let data;

	let pendingMetricsLoggingEnabled: boolean | null = null;
	$: metricsLoggingEnabled = pendingMetricsLoggingEnabled ?? data.metricsLoggingEnabled;

	const optimisticallyToggleMetrics: SubmitFunction = () => {
		pendingMetricsLoggingEnabled = !metricsLoggingEnabled;

		return async ({ update }) => {
			await update();
			pendingMetricsLoggingEnabled = null;
		};
	};

	type TrendChart = ChartInstance<'line', number[], string>;
	type DailyModeChart = ChartInstance<'bar', number[], string>;
	type DailyModeMetric = 'guesses' | 'wins';
	type ModeKey = 'weapon' | 'weapon-2' | 'map' | 'cosmetic' | 'unusual';

	let trendCanvas: HTMLCanvasElement;
	let modeGuessesCanvas: HTMLCanvasElement;
	let modeWinsCanvas: HTMLCanvasElement;
	let trendChart: TrendChart | undefined;
	let modeGuessesChart: DailyModeChart | undefined;
	let modeWinsChart: DailyModeChart | undefined;
	let ChartConstructor: typeof import('chart.js/auto').default | undefined;
	$: metrics = data.metrics;
	$: dailyTotals = [...metrics.daily].reverse();
	$: modeStartsMax = Math.max(1, ...metrics.modes.map((mode) => mode.starts));
	$: if (metrics && (trendChart || modeGuessesChart || modeWinsChart)) {
		updateCharts();
	}

	onMount(() => {
		let disposed = false;

		import('chart.js/auto').then(({ default: Chart }) => {
			if (disposed) return;

			ChartConstructor = Chart;
			createCharts();
		});

		return () => {
			disposed = true;
			trendChart?.destroy();
			modeGuessesChart?.destroy();
			modeWinsChart?.destroy();
		};
	});

	function formatNumber(value: number) {
		return new Intl.NumberFormat('en-US').format(value);
	}

	function formatPercent(value: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'percent',
			maximumFractionDigits: 1
		}).format(value);
	}

	function formatDecimal(value: number) {
		return value === 0 ? '0' : value.toFixed(1);
	}

	function createTrendChart() {
		if (!ChartConstructor || !trendCanvas) return;

		trendChart = new ChartConstructor(trendCanvas, getTrendChartConfig()) as TrendChart;
	}

	function createCharts() {
		createTrendChart();
		createDailyModeChart('guesses');
		createDailyModeChart('wins');
	}

	function createDailyModeChart(metric: DailyModeMetric) {
		if (!ChartConstructor) return;

		const canvas = metric === 'guesses' ? modeGuessesCanvas : modeWinsCanvas;
		if (!canvas) return;

		const chart = new ChartConstructor(canvas, getDailyModeChartConfig(metric)) as DailyModeChart;

		if (metric === 'guesses') {
			modeGuessesChart = chart;
		} else {
			modeWinsChart = chart;
		}
	}

	function updateCharts() {
		updateTrendChart();
		updateDailyModeChart('guesses');
		updateDailyModeChart('wins');
	}

	function updateTrendChart() {
		if (!trendChart) return;

		const config = getTrendChartConfig();
		trendChart.data = config.data;
		trendChart.options = config.options ?? {};
		trendChart.update();
	}

	function updateDailyModeChart(metric: DailyModeMetric) {
		const chart = metric === 'guesses' ? modeGuessesChart : modeWinsChart;
		if (!chart) return;

		const config = getDailyModeChartConfig(metric);
		chart.data = config.data;
		chart.options = config.options ?? {};
		chart.update();
	}

	function getTrendChartConfig(): ChartConfiguration<'line', number[], string> {
		const startsColor = cssHsl('--primary', 'rgb(234 88 12)');
		const mutedColor = cssHsl('--muted-foreground', 'rgb(120 113 108)');
		const borderColor = cssHsl('--border', 'rgb(214 211 209)');
		const cardColor = cssHsl('--card', 'rgb(255 255 255)');

		return {
			type: 'line',
			data: {
				labels: metrics.daily.map((day) => day.label),
				datasets: [
					{
						label: 'Starts',
						data: metrics.daily.map((day) => day.starts),
						borderColor: startsColor,
						backgroundColor: startsColor,
						tension: 0.35
					},
					{
						label: 'Guesses',
						data: metrics.daily.map((day) => day.guesses),
						borderColor: 'rgb(56 189 248)',
						backgroundColor: 'rgb(56 189 248)',
						tension: 0.35
					},
					{
						label: 'Wins',
						data: metrics.daily.map((day) => day.wins),
						borderColor: 'rgb(34 197 94)',
						backgroundColor: 'rgb(34 197 94)',
						tension: 0.35
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				elements: {
					line: {
						borderWidth: 3
					},
					point: {
						hoverRadius: 5,
						radius: 2.5
					}
				},
				plugins: {
					legend: {
						align: 'start',
						labels: {
							boxHeight: 8,
							boxWidth: 8,
							color: mutedColor,
							usePointStyle: true
						}
					},
					tooltip: {
						backgroundColor: cardColor,
						borderColor,
						borderWidth: 1,
						bodyColor: mutedColor,
						padding: 12,
						titleColor: startsColor
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						},
						ticks: {
							autoSkip: true,
							color: mutedColor,
							maxRotation: 0
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: borderColor
						},
						ticks: {
							color: mutedColor,
							precision: 0
						}
					}
				}
			}
		};
	}

	function cssHsl(variableName: string, fallback: string) {
		if (typeof window === 'undefined') return fallback;

		const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();

		return value ? `hsl(${value})` : fallback;
	}

	function getDailyModeChartConfig(
		metric: DailyModeMetric
	): ChartConfiguration<'bar', number[], string> {
		const mutedColor = cssHsl('--muted-foreground', 'rgb(120 113 108)');
		const borderColor = cssHsl('--border', 'rgb(214 211 209)');
		const cardColor = cssHsl('--card', 'rgb(255 255 255)');
		const modeColors: Record<ModeKey, string> = {
			weapon: cssHsl('--primary', 'rgb(234 88 12)'),
			'weapon-2': 'rgb(56 189 248)',
			map: 'rgb(34 197 94)',
			cosmetic: 'rgb(217 70 239)',
			unusual: 'rgb(245 158 11)'
		};

		return {
			type: 'bar',
			data: {
				labels: metrics.dailyModes.map((day) => day.label),
				datasets:
					metrics.dailyModes[0]?.modes.map((mode) => ({
						label: mode.label,
						data: metrics.dailyModes.map(
							(day) =>
								day.modes.find((dailyMode) => dailyMode.gameMode === mode.gameMode)?.[metric] ?? 0
						),
						backgroundColor: modeColors[mode.gameMode as ModeKey],
						borderSkipped: false,
						borderWidth: 0,
						borderRadius: 3,
						maxBarThickness: 28,
						stack: 'game-modes'
					})) ?? []
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						align: 'start',
						labels: {
							boxHeight: 8,
							boxWidth: 8,
							color: mutedColor,
							usePointStyle: true
						}
					},
					tooltip: {
						backgroundColor: cardColor,
						borderColor,
						borderWidth: 1,
						bodyColor: mutedColor,
						padding: 12,
						titleColor: cssHsl('--primary', 'rgb(234 88 12)')
					}
				},
				scales: {
					x: {
						stacked: true,
						grid: {
							display: false
						},
						ticks: {
							autoSkip: true,
							color: mutedColor,
							maxRotation: 0
						}
					},
					y: {
						beginAtZero: true,
						stacked: true,
						grid: {
							color: borderColor
						},
						ticks: {
							color: mutedColor,
							precision: 0
						}
					}
				}
			}
		};
	}

	function barWidth(value: number, max: number) {
		return `${Math.round((value / max) * 100)}%`;
	}
</script>

<main class="mx-auto grid w-full max-w-7xl gap-4 px-4">
	<section class="flex flex-wrap items-center justify-between gap-4" aria-label="Metrics controls">
		<nav
			class="flex items-center rounded-lg border border-border bg-card text-sm"
			aria-label="Dashboard month"
		>
			<a
				class="grid h-9 w-9 place-items-center rounded-l-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
				href="/admin?month={metrics.month.previousMonthParam}"
				aria-label="Previous month"
			>
				<ChevronLeft size={18} />
			</a>
			<span
				class="min-w-36 border-x border-border px-4 py-2 text-center font-medium text-foreground"
			>
				{metrics.month.label}
			</span>
			{#if metrics.month.isCurrentMonth}
				<span
					class="grid h-9 w-9 cursor-not-allowed place-items-center rounded-r-lg text-muted-foreground/40"
					aria-label="Next month unavailable"
				>
					<ChevronRight size={18} />
				</span>
			{:else}
				<a
					class="grid h-9 w-9 place-items-center rounded-r-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
					href="/admin?month={metrics.month.nextMonthParam}"
					aria-label="Next month"
				>
					<ChevronRight size={18} />
				</a>
			{/if}
		</nav>
		<form
			method="POST"
			action="/admin?/setMetricsLogging"
			use:enhance={optimisticallyToggleMetrics}
		>
			<input type="hidden" name="enabled" value={metricsLoggingEnabled ? 'false' : 'true'} />
			<button
				class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
				type="submit"
				aria-pressed={metricsLoggingEnabled}
				disabled={pendingMetricsLoggingEnabled !== null}
				title={metricsLoggingEnabled ? 'Pause metrics logging' : 'Resume metrics logging'}
			>
				<span class:enabled={metricsLoggingEnabled} class="metrics-switch" aria-hidden="true">
					<span></span>
				</span>
				Metrics logging
			</button>
		</form>
	</section>

	<section class="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
		<KpiCard label="Starts" value={formatNumber(metrics.kpis.starts)} />
		<KpiCard label="Wins" value={formatNumber(metrics.kpis.wins)} />
		<KpiCard label="Solve rate" value={formatPercent(metrics.kpis.solveRate)} />
		<KpiCard label="Guesses" value={formatNumber(metrics.kpis.guesses)} />
		<KpiCard label="Avg guesses" value={formatDecimal(metrics.kpis.averageGuessesToWin)} />
		<KpiCard label="Patch views" value={formatNumber(metrics.kpis.patchNotesViews)} />
	</section>

	<section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
		<Card.Root class="flex flex-col bg-card/90">
			<Card.Header>
				<Card.Title>Daily gameplay trend</Card.Title>
				<Card.Description>Starts, guesses, and wins across the selected month.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col">
				<div class="min-h-[360px] flex-1">
					<canvas bind:this={trendCanvas} aria-label="Daily gameplay trend chart">
						Daily gameplay trend chart
					</canvas>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="grid gap-6">
			<Card.Root class="bg-card/90">
				<Card.Header>
					<Card.Title>Starts by mode</Card.Title>
					<Card.Description>Which games people actually begin.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					{#each metrics.modes as mode}
						<div class="grid gap-1">
							<div class="flex justify-between text-sm">
								<span>{mode.label}</span>
								<span class="text-muted-foreground">{formatNumber(mode.starts)}</span>
							</div>
							<div class="h-3 overflow-hidden rounded-full bg-muted">
								<div
									class="h-full rounded-full bg-primary"
									style:width={barWidth(mode.starts, modeStartsMax)}
								></div>
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<Card.Root class="bg-card/90">
				<Card.Header>
					<Card.Title>Solve rate by mode</Card.Title>
					<Card.Description>Lower rates usually mean higher difficulty.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					{#each metrics.modes as mode}
						<div class="grid gap-1">
							<div class="flex justify-between text-sm">
								<span>{mode.label}</span>
								<span class="text-muted-foreground">{formatPercent(mode.solveRate)}</span>
							</div>
							<div class="h-3 overflow-hidden rounded-full bg-muted">
								<div
									class="h-full rounded-full bg-green-500"
									style:width={barWidth(mode.solveRate, 1)}
								></div>
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-2">
		<Card.Root class="bg-card/90">
			<Card.Header>
				<Card.Title>Daily guesses by mode</Card.Title>
				<Card.Description
					>Each day split by the game mode that received the guesses.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<div class="min-h-[340px]">
					<canvas bind:this={modeGuessesCanvas} aria-label="Daily guesses by game mode chart">
						Daily guesses by game mode chart
					</canvas>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-card/90">
			<Card.Header>
				<Card.Title>Daily solves by mode</Card.Title>
				<Card.Description>Each day split by the game mode players solved.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="min-h-[340px]">
					<canvas bind:this={modeWinsCanvas} aria-label="Daily solves by game mode chart">
						Daily solves by game mode chart
					</canvas>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid gap-6 xl:grid-cols-2">
		<Card.Root class="bg-card/90">
			<Card.Header>
				<Card.Title>Mode summary</Card.Title>
				<Card.Description>Exact gameplay totals for the month.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="text-left text-muted-foreground">
							<tr class="border-b">
								<th class="py-2 pr-3">Mode</th>
								<th class="py-2 pr-3 text-right">Starts</th>
								<th class="py-2 pr-3 text-right">Guesses</th>
								<th class="py-2 pr-3 text-right">Wins</th>
								<th class="py-2 pr-3 text-right">Solve</th>
								<th class="py-2 text-right">Avg</th>
							</tr>
						</thead>
						<tbody>
							{#each metrics.modes as mode}
								<tr class="border-b last:border-0">
									<td class="py-2 pr-3 font-medium">{mode.label}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(mode.starts)}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(mode.guesses)}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(mode.wins)}</td>
									<td class="py-2 pr-3 text-right">{formatPercent(mode.solveRate)}</td>
									<td class="py-2 text-right">{formatDecimal(mode.averageGuessesToWin)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-card/90">
			<Card.Header>
				<Card.Title>Daily totals</Card.Title>
				<Card.Description>Zero-filled calendar days for the selected month.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="max-h-[420px] overflow-auto pr-2">
					<table class="w-full text-sm">
						<thead class="sticky top-0 bg-card text-left text-muted-foreground">
							<tr class="border-b">
								<th class="py-2 pr-3">Date</th>
								<th class="py-2 pr-3 text-right">Starts</th>
								<th class="py-2 pr-3 text-right">Guesses</th>
								<th class="py-2 pr-3 text-right">Wins</th>
								<th class="py-2 text-right">Patch views</th>
							</tr>
						</thead>
						<tbody>
							{#each dailyTotals as day}
								<tr class="border-b last:border-0">
									<td class="py-2 pr-3 font-medium">{day.label}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(day.starts)}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(day.guesses)}</td>
									<td class="py-2 pr-3 text-right">{formatNumber(day.wins)}</td>
									<td class="py-2 text-right">{formatNumber(day.patchNotesViews)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<section>
		<AdminLogs />
	</section>
</main>

<style>
	.metrics-switch {
		display: inline-flex;
		width: 1.9rem;
		height: 1rem;
		align-items: center;
		border-radius: 9999px;
		background: hsl(var(--muted));
		padding: 0.125rem;
		transition: background-color 150ms ease;
	}

	.metrics-switch.enabled {
		background: hsl(var(--primary));
	}

	.metrics-switch span {
		height: 0.75rem;
		width: 0.75rem;
		border-radius: 9999px;
		background: hsl(var(--background));
		transition: transform 150ms ease;
	}

	.metrics-switch.enabled span {
		transform: translateX(0.9rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.metrics-switch,
		.metrics-switch span {
			transition: none;
		}
	}
</style>
