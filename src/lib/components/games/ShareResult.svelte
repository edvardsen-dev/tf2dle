<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildShareText, type ShareMode } from '$lib/share';
	import { Share } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let mode: ShareMode;
	export let guesses: unknown[];
	export let streak: number;
	export let variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' =
		'default';
	export let label = 'Share result';
	export let copiedLabel = 'Copied!';

	let clazz: string;
	export { clazz as class };

	let copied = false;
	let resetCopiedTimeout: ReturnType<typeof setTimeout> | undefined;

	$: shareText = buildShareText({ mode, guesses, streak });

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
			}, 2500);
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

<Button {variant} class={clazz} on:click={copy} data-testId="share-result">
	<Share class="mr-2 h-4 w-4" />
	{copied ? copiedLabel : label}
</Button>
