<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { buttonVariants } from '#lib/components/ui/button/index.ts';
	import { cn } from '#lib/utils.ts';

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogPrimitive.ActionProps = $props();
</script>

<AlertDialogPrimitive.Action class={cn(buttonVariants(), className)} bind:ref {...restProps}>
	{@render children?.()}
</AlertDialogPrimitive.Action>
