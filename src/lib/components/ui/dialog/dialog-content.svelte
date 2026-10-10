<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { X } from '@lucide/svelte';
	import * as Dialog from './index.ts';
	import { cn, flyAndScale } from '#lib/utils.ts';

	type Props = Omit<DialogPrimitive.ContentProps, 'child'> & {
		transition?: typeof flyAndScale;
		transitionConfig?: Parameters<typeof flyAndScale>[1];
	};
	let {
		class: className,
		ref = $bindable(null),
		forceMount = false,
		transition = flyAndScale,
		transitionConfig = { duration: 200 },
		children,
		...restProps
	}: Props = $props();
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		{...restProps}
		bind:ref
		forceMount
		class={cn(
			'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full',
			className
		)}
	>
		{#snippet child({ props, open })}
			{#if open || forceMount}
				<div {...props} transition:transition={transitionConfig}>
					{@render children?.()}
					<DialogPrimitive.Close
						class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					>
						<X class="h-4 w-4" />
						<span class="sr-only">Close</span>
					</DialogPrimitive.Close>
				</div>
			{/if}
		{/snippet}
	</DialogPrimitive.Content>
</Dialog.Portal>
