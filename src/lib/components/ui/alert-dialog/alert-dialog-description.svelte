<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.ts';

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogPrimitive.DescriptionProps = $props();
</script>

<AlertDialogPrimitive.Description
	class={cn('text-sm text-muted-foreground', className)}
	bind:ref
	{...restProps}
>
	{@render children?.()}
</AlertDialogPrimitive.Description>
