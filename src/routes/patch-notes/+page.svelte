<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { latestUpdateId, lastViewedUpdate, updateMonths } from '$lib/features/patchNotes';
	import { onMount } from 'svelte';
	import PatchNoteItem from '$lib/features/patchNotes/components/patch-note-item.svelte';
	import PatchNoteSidebar from '$lib/features/patchNotes/components/patch-note-sidebar.svelte';

	onMount(() => {
		lastViewedUpdate.set(latestUpdateId);
	});
</script>

<!-- 
121px: Translate the wrapper half the sidebar (250px / 2 = 125px) + half the gap (8px / 2 = 4px) 
between the sidebar and the main content (total: 125px - 4px = 121px). Makes the main content 
in the center of the screen 
-->
<div class="flex gap-2 justify-center xl:-translate-x-[121px]">
	<PatchNoteSidebar />
	<div class="width">
		{#each updateMonths as month}
			<Card.Root class="mb-4 update-month" id={month.id}>
				<Card.Header>
					<div class="border-b-2 pb-4">
						<Card.Title class="text-2xl">{month.title}</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					{#each month.dates as updateDate}
						<section class="mb-8 last:mb-0">
							<h3 class="text-lg font-semibold mb-4">{updateDate.title}</h3>

							{#if updateDate.new.length > 0}
								<h4 class="text-sm text-primary font-semibold mb-2">New</h4>
								{#each updateDate.new as item}
									<PatchNoteItem {item} />
								{/each}
							{/if}

							{#if updateDate.improved.length > 0}
								<h4 class="text-sm text-primary font-semibold mb-2">Improved</h4>
								{#each updateDate.improved as item}
									<PatchNoteItem {item} />
								{/each}
							{/if}

							{#if updateDate.fixed.length > 0}
								<h4 class="text-sm text-primary font-semibold mb-2">Fixed</h4>
								{#each updateDate.fixed as item}
									<PatchNoteItem {item} />
								{/each}
							{/if}
						</section>
					{/each}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<style>
	:global(.patch-link) {
		text-decoration: underline;
	}

	.width {
		width: min(100%, 700px);
	}
</style>
