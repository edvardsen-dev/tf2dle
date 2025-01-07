<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { AreaChart, Dices, Flame, Loader2, RotateCw } from 'lucide-svelte';
	import ColorExplanation from './ColorExplanation.svelte';
	import StatsDialog from './StatsDialog.svelte';
	import VictoryDialog from './VictoryDialog.svelte';
	import type { Writable } from 'svelte/store';
	import type { UseStats } from '$lib/composables/useStats';
	import { page } from '$app/stores';
	import WinterDecore from '$lib/features/theme/components/winter/WinterDecore.svelte';

	export let title: string;
	export let description: string;
	export let img: { basePath: string; guessKey: string };
	export let loadingState: 'loading' | 'error' | 'success';
	export let nextChallenge: string | undefined = undefined;

	// TODO: Pass in generic?
	export let guesses: Writable<any>;
	export let streak: Writable<number>;
	export let stats: UseStats;
	export let numberOfCorrectGuesses: Writable<number | undefined>;
	export let openVictoryDialog: Writable<boolean>;

	let openStatsDialog = false;
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
					<button on:click={() => (openStatsDialog = true)} data-testId="openStatsDialog">
						<AreaChart aria-label="Stats" />
					</button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<WinterDecore />
			{#if loadingState === 'loading'}
				<div class="flex justify-center p-4">
					<Loader2 class="h-4 w-4 animate-spin" />
				</div>
			{:else if loadingState === 'error'}
				<a
					data-sveltekit-reload
					href={$page.url.pathname}
					class="grid justify-items-center gap-4 p-4"
					data-testId="refresh"
				>
					Something went wrong. Please try to refresh.
					<RotateCw class="w-4 h-4" />
				</a>
			{:else}
				<slot />
			{/if}
		</Card.Content>
		<Card.Footer class="text-sm text-muted-foreground">
			<slot name="footer" />
		</Card.Footer>
	</Card.Root>

	<ColorExplanation />

	<StatsDialog bind:open={openStatsDialog} stats={$stats} />

	{#if $guesses.length > 0}
		<VictoryDialog
			img={{ src: `${img.basePath}${$guesses[0][img.guessKey]}.png`, alt: $guesses[0].name }}
			imgSize="10rem"
			challenge="Weapon"
			value={$guesses[0].name}
			tries={$guesses.length}
			streak={$streak}
			correctGuesses={$numberOfCorrectGuesses ?? 1}
			{nextChallenge}
			bind:open={$openVictoryDialog}
		/>
	{/if}
</div>
