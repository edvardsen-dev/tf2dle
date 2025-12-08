<script lang="ts">
	import { Scroll } from 'lucide-svelte';
	import Settings from '$lib/components/Settings.svelte';
	import patchNotes from '$lib/features/patchNotes';
	import { lastViewedPatchNote } from '$lib/features/patchNotes';
	import LogoHat from '$lib/features/theme/components/LogoHat.svelte';

	const lastPatchNote = patchNotes[0];

	$: hasViewedPatchNotes = $lastViewedPatchNote === lastPatchNote.version;
</script>

<header class="flex items-center justify-center">
	<Settings />
	<a href="/" class="cursor-pointer relative">
		<LogoHat />
		<img class="w-80" src="/images/logo.png" alt="logo" />
	</a>
	<a
		href="/patch-notes"
		class="text-muted-foreground relative"
		title="Patch notes"
		aria-label="Patch notes"
	>
		<Scroll />
		{#if !hasViewedPatchNotes}
			<div class="size-[5px] bg-primary rounded-full absolute -top-1 -right-1"></div>
		{/if}
	</a>
</header>
