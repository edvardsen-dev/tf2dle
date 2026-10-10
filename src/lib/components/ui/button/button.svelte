<script lang="ts">
	import { cn } from '#lib/utils.ts';
	import { buttonVariants, type Props } from './index.ts';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		href,
		type = 'button',
		disabled,
		children,
		...restProps
	}: Props = $props();
</script>

{#if href !== undefined && href !== null}
	<a
		{...restProps}
		href={disabled ? undefined : href}
		class={cn(
			buttonVariants({ variant, size }),
			className,
			disabled && 'pointer-events-none opacity-50'
		)}
		aria-disabled={disabled ? true : restProps['aria-disabled']}
		tabindex={disabled ? -1 : restProps.tabindex}
	>
		{@render children?.()}
	</a>
{:else}
	<button {...restProps} {type} {disabled} class={cn(buttonVariants({ variant, size }), className)}>
		{@render children?.()}
	</button>
{/if}
