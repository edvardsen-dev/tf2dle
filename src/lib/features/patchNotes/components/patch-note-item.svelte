<script lang="ts">
	import type { UpdateCredit, UpdateEntry } from '$lib/features/patchNotes/types';

	export let item: UpdateEntry;

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
</script>

<article class="mb-6">
	<div class="flex flex-wrap items-center gap-2 mb-2">
		{#if item.href}
			<a href={item.href} class="font-semibold patch-link">{item.title}</a>
		{:else}
			<h5 class="font-semibold">{item.title}</h5>
		{/if}

		{#if item.gameModes}
			{#each item.gameModes as mode}
				<p class="text-xs bg-muted rounded-full w-fit px-3 py-1 text-muted-foreground">{mode}</p>
			{/each}
		{/if}
	</div>

	{#if item.description}
		<p class="text-sm leading-6">{item.description}</p>
	{/if}

	{#if item.credit}
		<p class="text-sm text-muted-foreground mt-2">
			{getCreditLabel(item.credit)}
			<a href={item.credit.user.link} target="_blank" class="patch-link">{item.credit.user.name}</a>
			{getCreditSuffix(item.credit)}
		</p>
	{/if}
</article>
