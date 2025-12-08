<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import patchNotes, { lastViewedPatchNote } from '$lib/features/patchNotes';
	import { onMount } from 'svelte';
	import PatchNoteItem from '$lib/features/patchNotes/components/patch-note-item.svelte';
	import PatchNoteSidebar from '$lib/features/patchNotes/components/patch-note-sidebar.svelte';

	onMount(() => {
		lastViewedPatchNote.set(patchNotes[0].version);
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
		{#each patchNotes as patch}
			<Card.Root class="mb-4 patch-note" id={patch.version}>
				<Card.Header>
					<div class="border-b-2 pb-4">
						<Card.Title class="text-2xl">Patch {patch.version}</Card.Title>
						<Card.Description>{patch.date}</Card.Description>
					</div>
				</Card.Header>
				<Card.Content>
					<!-- New Features -->
					{#if patch.newFeatures.length > 0}
						<h3 class="text-sm text-primary font-semibold mb-2">New Features</h3>
						{#each patch.newFeatures as feature}
							<PatchNoteItem item={feature} />
						{/each}
					{/if}
					{#if patch.improvements.length > 0}
						<h3 class="text-sm text-primary font-semibold mb-2">Improvements</h3>
						{#each patch.improvements as improvement}
							<PatchNoteItem item={improvement} />
						{/each}
					{/if}
					{#if patch.bugFixes.length > 0}
						<h3 class="text-sm text-primary font-semibold mb-2">Bug fixes</h3>
						{#each patch.bugFixes as fix}
							<PatchNoteItem item={fix} />
						{/each}
					{/if}
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
