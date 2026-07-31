<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import dayjs from '$lib/configs/dayjsConfig';
	import WinterDecore from '$lib/features/theme/components/winter/WinterDecore.svelte';
	import { gameModes } from '$lib/game-modes';
	import { onMount } from 'svelte';

	type ModeStatus = {
		state: 'completed' | 'started' | 'not-started';
		guesses: number;
	};

	let modeStatuses: Record<string, ModeStatus> = {};

	onMount(() => {
		modeStatuses = Object.fromEntries(
			gameModes.map((gameMode) => [gameMode.href, getModeStatus(gameMode.href)])
		);
	});

	function getModeStatus(href: string): ModeStatus {
		const storageKey = storageKeyByHref[href];
		if (!storageKey) return { state: 'not-started', guesses: 0 };

		const guesses = parseJson<unknown[]>(localStorage.getItem(`${storageKey}_guesses`), []);
		const lastEvent = parseJson<{ event: string; date: string } | null>(
			localStorage.getItem(`${storageKey}_last_event`),
			null
		);
		const isToday = lastEvent?.date && dayjs.utc(lastEvent.date).isSame(dayjs.utc(), 'date');

		if (isToday && lastEvent?.event === 'won') {
			return { state: 'completed', guesses: guesses.length };
		}

		if (isToday && guesses.length > 0) {
			return { state: 'started', guesses: guesses.length };
		}

		return { state: 'not-started', guesses: 0 };
	}

	function parseJson<T>(value: string | null, fallback: T) {
		if (!value) return fallback;

		try {
			return JSON.parse(value) as T;
		} catch (err) {
			return fallback;
		}
	}

	const storageKeyByHref: Record<string, string> = {
		'/weapon': 'weapon',
		'/weapon-2': 'weapon_2',
		'/map': 'map',
		'/cosmetic': 'cosmetic',
		'/unusual': 'unusual'
	};
</script>

<Card.Root class="relative">
	<Card.Header>
		<Card.Title>Game modes</Card.Title>
		<Card.Description>Choose a game mode to play</Card.Description>
	</Card.Header>
	<Card.Content>
		<WinterDecore />
		<ul class="grid gap-2">
			{#each gameModes.filter((g) => !g.disabled) as gameMode}
				{@const status = modeStatuses[gameMode.href]}
				<li>
					<a
						href={`/game-modes${gameMode.href}`}
						data-testId={gameMode.name.toLowerCase()}
						class="relative grid gap-3 overflow-hidden rounded bg-secondary px-4 py-3 transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex sm:items-center sm:justify-between"
					>
						<div class="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
							<svelte:component this={gameMode.icon} class="mt-0.5 shrink-0 text-primary sm:mt-0" />
							<div>
								<h2 class="font-semibold">{gameMode.name}</h2>
								<p class="text-sm">{gameMode.description}</p>
							</div>
						</div>
						<div
							class="flex min-w-0 flex-wrap items-center gap-2 pl-8 text-xs sm:shrink-0 sm:justify-end sm:pl-0"
						>
							{#if status?.state === 'completed'}
								<span
									class="rounded-full border border-primary/40 px-2 py-1 font-medium text-primary sm:whitespace-nowrap"
								>
									Solved in {status.guesses}
								</span>
							{:else if status?.state === 'started'}
								<span
									class="rounded-full border border-border/70 px-2 py-1 text-muted-foreground sm:whitespace-nowrap"
								>
									{status.guesses}
									{status.guesses === 1 ? 'guess' : 'guesses'} today
								</span>
							{:else if gameMode.new}
								<span class="rounded-full bg-primary px-2 py-1 font-medium text-primary-foreground">
									New
								</span>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</Card.Content>
</Card.Root>
