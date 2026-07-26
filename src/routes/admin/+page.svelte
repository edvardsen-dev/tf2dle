<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import AdminLogs from './AdminLogs.svelte';
	import KpiCard from './KpiCard.svelte';

	export let data;

	const width = 720;
	const height = 240;
	const padding = 30;

	$: metrics = data.metrics;
	$: trendMax = Math.max(1, ...metrics.daily.flatMap((day) => [day.starts, day.guesses, day.wins]));
	$: modeStartsMax = Math.max(1, ...metrics.modes.map((mode) => mode.starts));
	$: guessesPath = linePath(metrics.daily, trendMax, 'guesses');
	$: startsPath = linePath(metrics.daily, trendMax, 'starts');
	$: winsPath = linePath(metrics.daily, trendMax, 'wins');

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

	function linePath(
		daily: typeof metrics.daily,
		max: number,
		metric: 'starts' | 'guesses' | 'wins'
	) {
		return daily
			.map((day, index) => {
				const x = padding + (index / Math.max(daily.length - 1, 1)) * (width - padding * 2);
				const y = height - padding - (day[metric] / max) * (height - padding * 2);

				return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
			})
			.join(' ');
	}

	function barWidth(value: number, max: number) {
		return `${Math.round((value / max) * 100)}%`;
	}
</script>

<main class="mx-auto grid w-full max-w-6xl gap-6 px-4">
	<section
		class="flex flex-col gap-4 rounded-xl border border-primary/20 bg-card/80 p-5 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-end md:justify-between"
	>
		<div>
			<p class="text-sm uppercase tracking-[0.35em] text-primary">TF2DLE Intel</p>
			<h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Business metrics</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				Anonymous aggregate usage for {metrics.month.label}, UTC.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<a class="month-button" href="/admin?month={metrics.month.previousMonthParam}"
				>Previous month</a
			>
			{#if metrics.month.isCurrentMonth}
				<span class="month-button-disabled">Next month</span>
			{:else}
				<a class="month-button" href="/admin?month={metrics.month.nextMonthParam}">Next month</a>
			{/if}
			<form method="POST" action="?/logout">
				<Button type="submit" variant="secondary">Logout</Button>
			</form>
		</div>
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
				<div class="flex min-h-[360px] flex-1 overflow-x-auto">
					<svg
						class="h-full min-w-[720px] flex-1 overflow-visible"
						viewBox="0 0 {width} {height}"
						role="img"
						aria-label="Daily gameplay trend chart"
					>
						<line
							x1={padding}
							y1={height - padding}
							x2={width - padding}
							y2={height - padding}
							class="stroke-border"
						/>
						<line
							x1={padding}
							y1={padding}
							x2={padding}
							y2={height - padding}
							class="stroke-border"
						/>
						<path d={guessesPath} fill="none" class="stroke-guesses" stroke-width="3" />
						<path d={startsPath} fill="none" class="stroke-starts" stroke-width="3" />
						<path d={winsPath} fill="none" class="stroke-wins" stroke-width="3" />
						{#each metrics.daily as day, index}
							{#if index === 0 || index === metrics.daily.length - 1 || day.date.endsWith('-15')}
								<text
									x={padding +
										(index / Math.max(metrics.daily.length - 1, 1)) * (width - padding * 2)}
									y={height - 7}
									text-anchor="middle"
									class="fill-muted-foreground text-[11px]"
								>
									{day.label}
								</text>
							{/if}
						{/each}
					</svg>
				</div>

				<div class="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
					<span class="legend"><span class="legend-dot bg-primary"></span>Starts</span>
					<span class="legend"><span class="legend-dot bg-sky-400"></span>Guesses</span>
					<span class="legend"><span class="legend-dot bg-green-500"></span>Wins</span>
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

<style>
	.month-button,
	.month-button-disabled {
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--border));
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.month-button {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
	}

	.month-button:hover {
		background: hsl(var(--accent));
	}

	.month-button-disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.stroke-starts {
		stroke: hsl(var(--primary));
	}

	.stroke-guesses {
		stroke: rgb(56 189 248);
	}

	.stroke-wins {
		stroke: rgb(34 197 94);
	}

	.legend {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.legend-dot {
		height: 0.65rem;
		width: 0.65rem;
		border-radius: 9999px;
	}
</style>
