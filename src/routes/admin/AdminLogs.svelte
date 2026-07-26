<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { onDestroy, onMount } from 'svelte';

	type LogEntry = {
		id: number;
		createdAt: string;
		event: string;
		message: string;
	};

	type LogsResponse = {
		items: LogEntry[];
		nextCursor: number | null;
		hasMore: boolean;
	};

	let logs: LogEntry[] = [];
	let nextCursor: number | null = null;
	let hasMore = true;
	let loading = false;
	let errorMessage = '';
	let sentinel: HTMLDivElement;
	let observer: IntersectionObserver;

	onMount(() => {
		void loadLogs();

		observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void loadLogs();
				}
			},
			{
				rootMargin: '160px'
			}
		);

		if (sentinel) {
			observer.observe(sentinel);
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	async function loadLogs() {
		if (loading || !hasMore) return;

		loading = true;
		errorMessage = '';

		try {
			const params = new URLSearchParams({ limit: '30' });

			if (nextCursor) {
				params.set('afterId', String(nextCursor));
			}

			const response = await fetch(`/admin/logs?${params}`);

			if (!response.ok) {
				throw new Error('Could not load logs.');
			}

			const data = (await response.json()) as LogsResponse;
			logs = [...logs, ...data.items];
			nextCursor = data.nextCursor;
			hasMore = data.hasMore;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Could not load logs.';
		} finally {
			loading = false;
		}
	}

	function formatTimestamp(value: string) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
			timeZone: 'UTC'
		}).format(new Date(value));
	}
</script>

<Card.Root class="bg-card/90">
	<Card.Header>
		<div class="flex items-center justify-between gap-4">
			<div>
				<Card.Title>Operational logs</Card.Title>
				<Card.Description>Newest first. Scroll to load older entries.</Card.Description>
			</div>
			<span class="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
				{logs.length} loaded
			</span>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="h-[420px] overflow-y-auto pr-2 text-sm">
			{#if logs.length === 0 && !loading && !errorMessage}
				<p class="rounded-md border border-dashed border-border p-4 text-center text-muted-foreground">
					No log entries found.
				</p>
			{/if}

			<div class="grid gap-3">
				{#each logs as log}
					<article class="rounded-lg border border-border bg-muted/30 px-3 py-2">
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
							<span class="font-medium text-foreground">#{log.id}</span>
							<span>{formatTimestamp(log.createdAt)} UTC</span>
							<span class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{log.event}</span>
						</div>
						<p class="mt-2 whitespace-pre-wrap break-words text-foreground">{log.message}</p>
					</article>
				{/each}
			</div>

			<div bind:this={sentinel} class="grid min-h-16 place-items-center text-muted-foreground">
				{#if loading}
					<span>Loading older entries...</span>
				{:else if errorMessage}
					<button class="text-primary underline" type="button" on:click={loadLogs}>
						{errorMessage} Retry
					</button>
				{:else if !hasMore && logs.length > 0}
					<span>End of log list</span>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
