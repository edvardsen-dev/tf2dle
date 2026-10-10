<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';
	import { ChartArea, Dices, Flame, RotateCw } from '@lucide/svelte';
	import ColorExplanation from './ColorExplanation.svelte';
	import GameLoadingSkeleton from './GameLoadingSkeleton.svelte';
	import StatsDialog from './StatsDialog.svelte';
	import VictoryDialog from './VictoryDialog.svelte';
	import type { Writable } from 'svelte/store';
	import type { Snippet } from 'svelte';
	import type { UseStats } from '#lib/composables/useStats.ts';
	import { page } from '$app/state';
	import WinterDecore from '#lib/features/theme/components/winter/WinterDecore.svelte';
	import type { ShareMode } from '#lib/share.ts';

	interface Props {
		title: string;
		challenge: string;
		shareMode: ShareMode;
		description: string;
		img: { basePath: string; guessKey: string };
		loadingState: 'loading' | 'error' | 'success';
		nextChallenge?: string;
		// TODO: Pass in generic?
		guesses: Writable<any>;
		streak: Writable<number>;
		stats: UseStats;
		numberOfCorrectGuesses: Writable<number | undefined>;
		openVictoryDialog: Writable<boolean>;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		title,
		challenge,
		shareMode,
		description,
		img,
		loadingState,
		nextChallenge,
		guesses,
		streak,
		stats,
		numberOfCorrectGuesses,
		openVictoryDialog,
		children,
		footer
	}: Props = $props();

	let openStatsDialog = $state(false);
</script>

<div class="grid gap-4">
	<Card.Root class="relative">
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title data-testId="title">{title}</Card.Title>
					<Card.Description>{description}</Card.Description>
				</div>
				<div class="flex gap-4">
					<p class="flex items-center gap-1">
						<Dices aria-label="Number of guesses" />
						{$guesses.length}
					</p>
					<p class="flex items-center gap-1">
						<Flame aria-label="Streak" />
						{$streak}
					</p>
					<button
						onclick={() => (openStatsDialog = true)}
						aria-label="Open stats"
						data-testId="openStatsDialog"
					>
						<ChartArea />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<WinterDecore />
			{#if loadingState === 'loading'}
				<GameLoadingSkeleton />
			{:else if loadingState === 'error'}
				<a
					data-sveltekit-reload
					href={page.url.pathname}
					class="grid justify-items-center gap-4 p-4"
					data-testId="refresh"
				>
					Something went wrong. Please try to refresh.
					<RotateCw class="w-4 h-4" />
				</a>
			{:else}
				{@render children()}
			{/if}
		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground">
			{@render footer?.()}
		</Card.Footer>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#if $guesses.length > 0}
		<VictoryDialog
			img={{ src: `${img.basePath}${$guesses[0][img.guessKey]}.png`, alt: $guesses[0].name }}
			imgSize="10rem"
			{challenge}
			value={$guesses[0].name}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={$numberOfCorrectGuesses ?? 1}
			{nextChallenge}
			{shareMode}
			shareGuesses={$guesses}
			bind:open={$openVictoryDialog}
		/>
	{/if}
</div>
