<script lang="ts">
	import { speechBubbleVariants, type Props } from './index.ts';
	import { cn } from '#lib/utils.ts';

	let { class: className, arrowSide = 'right', children, ...restProps }: Props = $props();
</script>

<div class={cn(speechBubbleVariants({ arrowSide }), className)} {...restProps}>
	{@render children?.()}
</div>
