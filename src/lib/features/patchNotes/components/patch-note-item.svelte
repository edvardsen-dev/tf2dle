<script lang="ts">
	import type { Change } from '$lib/features/patchNotes/types';

	export let item: Change;
</script>

<article class="mb-6">
	<h4 class="font-semibold mb-2">{item.title}</h4>
	<p class="text-sm leading-6">{@html item.description}</p>
	{#if item.reportedBy}
		<p class="text-sm text-muted-foreground mt-2">
			Reported by:
			<a href={item.reportedBy.user.link} target="_blank" class="patch-link"
				>{item.reportedBy.user.name}</a
			>
			-
			{item.reportedBy.note}
		</p>
	{/if}
	<p class="text-sm text-muted-foreground mt-2">
		Author:
		<a href={item.author.link} target="_blank" class="patch-link">{item.author.name}</a>
	</p>
	<div class="flex gap-1 mt-4">
		{#if item.gameMode instanceof Array}
			{#each item.gameMode as mode}
				<p class="text-xs bg-muted rounded-full w-fit px-3 py-1 text-muted-foreground">{mode}</p>
			{/each}
		{:else}
			<p class="text-xs bg-muted rounded-full w-fit px-3 py-1 text-muted-foreground">
				{item.gameMode}
			</p>
		{/if}
	</div>
</article>
