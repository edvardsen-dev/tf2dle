<script lang="ts">
	import type { UpdateCredit, UpdateEntry } from '$lib/features/patchNotes/types';

	export let item: UpdateEntry;

	$: gameModeBadges = item.gameModes?.filter(isGameMode) ?? [];

	function getCreditLabel(credit: UpdateCredit) {
		if (credit.type === 'contribution') return 'Contributed by';
		if (credit.type === 'suggestion') return 'Thanks to';

		return 'Thanks to';
	}

	function getCreditSuffix(credit: UpdateCredit) {
		if (credit.type === 'suggestion') return 'for the suggestion.';
		if (credit.type === 'report') return 'for reporting this.';

		return '';
	}

	function isGameMode(mode: string) {
		return ['Weapon', 'Weapon 2', 'Map', 'Cosmetic', 'Unusual'].includes(mode);
	}
</script>

<article class="mb-4 grid grid-cols-[0.5rem_1fr] gap-3 last:mb-0">
	<div class="mt-2 size-1.5 rounded-full bg-primary/70"></div>

	<div>
		<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
			{#if item.href}
				<a href={item.href} class="font-medium leading-6 text-foreground patch-link">{item.title}</a
				>
			{:else}
				<h5 class="font-medium leading-6 text-foreground">{item.title}</h5>
			{/if}

			{#if gameModeBadges.length > 0}
				{#each gameModeBadges as mode}
					<p class="rounded-full bg-muted/70 px-2 py-0.5 text-[0.7rem] text-muted-foreground">
						{mode}
					</p>
				{/each}
			{/if}
		</div>

		{#if item.description}
			<p class="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
		{/if}

		{#if item.credit}
			<p class="mt-1 text-xs text-muted-foreground/80">
				{getCreditLabel(item.credit)}
				{#if item.credit.user.link}
					<a href={item.credit.user.link} target="_blank" class="patch-link"
						>{item.credit.user.name}</a
					>
				{:else}
					{item.credit.user.name}
				{/if}
				{getCreditSuffix(item.credit)}
			</p>
		{/if}
	</div>
</article>
