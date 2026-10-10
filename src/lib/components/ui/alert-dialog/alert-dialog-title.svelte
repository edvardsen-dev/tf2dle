<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.ts';

	let {
		class: className,
		level = 3,
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogPrimitive.TitleProps = $props();
</script>

<AlertDialogPrimitive.Title
	class={cn('text-lg font-semibold', className)}
	{level}
	bind:ref
	{...restProps}
>
	{@render children?.()}
</AlertDialogPrimitive.Title>
