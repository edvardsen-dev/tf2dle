<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.ts';

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	class={cn('text-lg font-semibold leading-none tracking-tight', className)}
	bind:ref
	{...restProps}
>
	{@render children?.()}
</DialogPrimitive.Title>
