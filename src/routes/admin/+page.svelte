<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js';
	import * as Card from '$lib/components/ui/card';
	import AdminLogs from './AdminLogs.svelte';
	import KpiCard from './KpiCard.svelte';

	export let data;

	type TrendChart = ChartInstance<'line', number[], string>;

	let trendCanvas: HTMLCanvasElement;
	let trendChart: TrendChart | undefined;
	let ChartConstructor: typeof import('chart.js/auto').default | undefined;
	$: metrics = data.metrics;
	$: modeStartsMax = Math.max(1, ...metrics.modes.map((mode) => mode.starts));
	$: if (trendChart) {
		updateTrendChart();
	}

	onMount(() => {
		let disposed = false;

		import('chart.js/auto').then(({ default: Chart }) => {
			if (disposed) return;

			ChartConstructor = Chart;
			createTrendChart();
		});

		return () => {
			disposed = true;
			trendChart?.destroy();
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

	function updateTrendChart() {
		if (!trendChart) return;

		const config = getTrendChartConfig();
		trendChart.data = config.data;
		trendChart.options = config.options ?? {};
		trendChart.update();
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

	function barWidth(value: number, max: number) {
		return `${Math.round((value / max) * 100)}%`;
	}
</script>

<main class="mx-auto grid w-full max-w-7xl gap-6 px-4">
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
							{#each metrics.daily as day}
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
