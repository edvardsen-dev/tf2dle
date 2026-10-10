<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.ts';

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	class={cn('text-sm text-muted-foreground', className)}
	bind:ref
	{...restProps}
>
	{@render children?.()}
</DialogPrimitive.Description>
