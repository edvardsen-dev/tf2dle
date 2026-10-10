<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	type Props = Omit<AlertDialogPrimitive.OverlayProps, 'child' | 'children'> & {
		children?: Snippet;
		transition?: typeof fade;
		transitionConfig?: Parameters<typeof fade>[1];
	};
	let {
		class: className,
		ref = $bindable(null),
		forceMount = false,
		transition = fade,
		transitionConfig = { duration: 150 },
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialogPrimitive.Overlay
	{...restProps}
	bind:ref
	forceMount
	class={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ', className)}
>
	{#snippet child({ props, open })}
		{#if open || forceMount}
			<div {...props} transition:transition={transitionConfig}>
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</AlertDialogPrimitive.Overlay>
