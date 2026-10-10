<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	type Props = Omit<SwitchPrimitive.RootProps, 'children'> & { children?: Snippet };
	let {
		class: className,
		checked = $bindable(false),
		ref = $bindable(null),
		children,
		...restProps
	}: Props = $props();
</script>

<SwitchPrimitive.Root
	bind:checked
	bind:ref
	class={cn(
		'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		class={cn(
			'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
		)}
	/>
	{@render children?.()}
</SwitchPrimitive.Root>
