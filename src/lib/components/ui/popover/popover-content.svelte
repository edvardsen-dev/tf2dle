<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '#lib/utils.ts';

	type Props = Omit<PopoverPrimitive.ContentProps, 'child'> & {
		transition?: typeof flyAndScale;
		transitionConfig?: Parameters<typeof flyAndScale>[1];
	};
	let {
		class: className,
		ref = $bindable(null),
		forceMount = false,
		transition = flyAndScale,
		transitionConfig,
		children,
		...restProps
	}: Props = $props();
</script>

<PopoverPrimitive.Content
	{...restProps}
	bind:ref
	forceMount
	class={cn(
		'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
		className
	)}
>
	{#snippet child({ props, wrapperProps, open })}
		<div {...wrapperProps}>
			{#if open || forceMount}
				<div {...props} transition:transition={transitionConfig}>
					{@render children?.()}
				</div>
			{/if}
		</div>
	{/snippet}
</PopoverPrimitive.Content>
