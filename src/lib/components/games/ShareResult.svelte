<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import { buildShareText, type ShareMode } from '#lib/share.ts';
	import { Check, Share } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		mode: ShareMode;
		guesses: unknown[];
		streak: number;
		variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
		label?: string;
		copiedLabel?: string;
		class?: string;
	}
	let {
		mode,
		guesses,
		streak,
		variant = 'default',
		label = 'Share result',
		copiedLabel = 'Copied!',
		class: clazz
	}: Props = $props();

	let copied = $state(false);
	let resetCopiedTimeout: ReturnType<typeof setTimeout> | undefined;

	let shareText = $derived(buildShareText({ mode, guesses, streak }));

	onDestroy(() => {
		if (resetCopiedTimeout) {
			clearTimeout(resetCopiedTimeout);
		}
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(shareText);
			copied = true;

			if (resetCopiedTimeout) {
				clearTimeout(resetCopiedTimeout);
			}

			resetCopiedTimeout = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			toast.error('Could not copy result to clipboard.', {
				action: {
					label: 'Retry',
					onClick: copy
				}
			});
		}
	}
</script>

<Button {variant} class={clazz} onclick={copy} data-testId="share-result">
	{#if copied}
		<Check class="mr-2 h-4 w-4" />
	{:else}
		<Share class="mr-2 h-4 w-4" />
	{/if}
	{copied ? copiedLabel : label}
</Button>
