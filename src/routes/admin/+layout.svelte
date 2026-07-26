<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Activity, ChevronLeft, ChevronRight, ExternalLink, LogOut } from 'lucide-svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let pendingMetricsLoggingEnabled: boolean | null = null;

	$: metrics = $page.data.metrics;
	$: metricsLoggingEnabled = pendingMetricsLoggingEnabled ?? $page.data.metricsLoggingEnabled;

	const optimisticallyToggleMetrics: SubmitFunction = () => {
		pendingMetricsLoggingEnabled = !metricsLoggingEnabled;

		return async ({ update }) => {
			await update();
			pendingMetricsLoggingEnabled = null;
		};
	};
</script>

<div class="min-h-screen bg-background text-foreground">
	<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
		<div class="absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-primary/15 blur-3xl"></div>
		<div class="absolute bottom-[-16rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-sky-500/10 blur-3xl"></div>
		<div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
	</div>

	<header class="border-b border-border/70 bg-background/85 backdrop-blur">
		<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
			<a href="/admin" class="flex items-center gap-3">
				<span class="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
					<Activity size={20} />
				</span>
				<span>
					<span class="block text-sm font-semibold uppercase tracking-[0.25em] text-primary">TF2DLE</span>
					<span class="block text-lg font-bold leading-tight">Admin console</span>
				</span>
			</a>

			{#if metrics}
				<nav class="flex items-center rounded-lg border border-border bg-card text-sm" aria-label="Dashboard month">
					<a
						class="grid h-9 w-9 place-items-center rounded-l-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
						href="/admin?month={metrics.month.previousMonthParam}"
						aria-label="Previous month"
					>
						<ChevronLeft size={18} />
					</a>
					<span class="min-w-36 border-x border-border px-4 py-2 text-center font-medium text-foreground">
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
							class="grid h-9 w-9 place-items-center rounded-r-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							href="/admin?month={metrics.month.nextMonthParam}"
							aria-label="Next month"
						>
							<ChevronRight size={18} />
						</a>
					{/if}
				</nav>
			{/if}

			<div class="flex items-center gap-3 text-sm text-muted-foreground">
				{#if metrics}
					<form method="POST" action="/admin?/setMetricsLogging" use:enhance={optimisticallyToggleMetrics}>
						<input type="hidden" name="enabled" value={metricsLoggingEnabled ? 'false' : 'true'} />
						<button
							class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 hover:bg-accent hover:text-accent-foreground"
							type="submit"
							aria-pressed={metricsLoggingEnabled}
							title={metricsLoggingEnabled ? 'Pause metrics logging' : 'Resume metrics logging'}
						>
							<span class:enabled={metricsLoggingEnabled} class="metrics-switch" aria-hidden="true">
								<span></span>
							</span>
							<span class="hidden md:inline">Metrics</span>
						</button>
					</form>
				{/if}
				<a class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/">
					Open app
					<ExternalLink size={14} />
				</a>
				{#if metrics}
					<form method="POST" action="/admin?/logout">
						<button
							class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 hover:bg-accent hover:text-accent-foreground"
							type="submit"
						>
							<LogOut size={14} />
							<span class="hidden sm:inline">Logout</span>
						</button>
					</form>
				{/if}
			</div>
		</div>
	</header>

	<div class="py-8">
		<slot />
	</div>
</div>

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
</style>
