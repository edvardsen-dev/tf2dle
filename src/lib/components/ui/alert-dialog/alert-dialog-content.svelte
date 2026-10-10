<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import * as AlertDialog from './index.ts';
	import { cn, flyAndScale } from '#lib/utils.ts';

	type Props = Omit<AlertDialogPrimitive.ContentProps, 'child'> & {
		transition?: typeof flyAndScale;
		transitionConfig?: Parameters<typeof flyAndScale>[1];
	};
	let {
		class: className,
		ref = $bindable(null),
		forceMount = false,
		transition = flyAndScale,
		transitionConfig,
		onOpenAutoFocus,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Portal>
	<AlertDialog.Overlay />
	<AlertDialogPrimitive.Content
		{...restProps}
		bind:ref
		forceMount
		onOpenAutoFocus={(event) => {
			onOpenAutoFocus?.(event);
			if (event.defaultPrevented) return;
			const cancel = ref?.querySelector<HTMLElement>('[data-alert-dialog-cancel]:not([disabled])');
			if (cancel) {
				event.preventDefault();
				cancel.focus({ preventScroll: true });
			}
		}}
		class={cn(
			'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full',
			className
		)}
	>
		{#snippet child({ props, open })}
			{#if open || forceMount}
				<div {...props} transition:transition={transitionConfig}>
					{@render children?.()}
				</div>
			{/if}
		{/snippet}
	</AlertDialogPrimitive.Content>
</AlertDialog.Portal>
