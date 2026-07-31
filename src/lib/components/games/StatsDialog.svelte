<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	export let stats: number[];
	export let open: boolean;

	const FULL_WIDTH = 100;

	$: maxWins = getMaxWins(stats);
	$: totalWins = stats.reduce((total, value) => total + (value ?? 0), 0);
	$: totalGuesses = stats.reduce((total, value, index) => total + (value ?? 0) * (index + 1), 0);
	$: averageGuesses = totalWins > 0 ? (totalGuesses / totalWins).toFixed(1) : '-';
	$: bestSolve = getBestSolve(stats);

	function getMaxWins(stats: number[]) {
		let max = 0;
		stats.forEach((value) => {
			if ((value ?? 0) > max) {
				max = value;
			}
		});
		return max;
	}

	function getBestSolve(stats: number[]) {
		const index = stats.findIndex((value) => (value ?? 0) > 0);

		return index === -1 ? '-' : `${index + 1}`;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Stats</Dialog.Title>
			<Dialog.Description>Overview of your guessing performance.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4" data-testId="statsDialog">
			{#if stats.length === 0}
				<div class="rounded-md bg-muted/20 p-4 text-sm" data-testId="noStatsMessage">
					<p class="font-medium text-foreground">No wins recorded yet.</p>
					<p class="mt-1 text-muted-foreground">
						Solve this mode once and your guess distribution will appear here.
					</p>
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-2 text-center text-sm">
					<div class="rounded-md bg-muted/20 p-3">
						<p class="text-lg font-semibold text-foreground">{totalWins}</p>
						<p class="text-xs text-muted-foreground">Wins</p>
					</div>
					<div class="rounded-md bg-muted/20 p-3">
						<p class="text-lg font-semibold text-foreground">{averageGuesses}</p>
						<p class="text-xs text-muted-foreground">Avg guesses</p>
					</div>
					<div class="rounded-md bg-muted/20 p-3">
						<p class="text-lg font-semibold text-foreground">{bestSolve}</p>
						<p class="text-xs text-muted-foreground">Best solve</p>
					</div>
				</div>
				<div class="grid gap-2">
					{#each stats as stat, index}
						<div class="grid grid-cols-[1.5rem_1fr_2rem] items-center gap-2" data-pw="statsGraph">
							<p class="text-sm text-muted-foreground">{index + 1}</p>
							<div class="h-6 rounded-sm bg-muted">
								<div
									class="h-full rounded-sm bg-primary bar"
									style="--width: {maxWins ? ((stat ?? 0) / maxWins) * FULL_WIDTH : 0}%"
								></div>
							</div>
							<p class="text-right text-sm">{stat || ''}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<style scoped>
	.bar {
		width: var(--width, 0);
	}
</style>
