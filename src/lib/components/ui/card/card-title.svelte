<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';
	import type { HeadingLevel } from './index.ts';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		tag?: HeadingLevel;
		children?: Snippet;
	};

	let { class: className, tag = 'h3', children, ...restProps }: Props = $props();
</script>

<svelte:element
	this={tag}
	class={cn('text-lg font-semibold leading-none tracking-tight', className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
