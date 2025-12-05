<script lang="ts">
    import { speechBubbleVariants, type Props } from '.';
    import { cn } from '$lib/utils';

    type $$Props = Props;

    let className: $$Props['class'] = undefined;
	export let arrowSide: $$Props['arrowSide'] = 'right';
    export { className as class };
</script>

<div 
    class={cn(speechBubbleVariants({arrowSide, className}))}
	{...$$restProps}
>
    <slot />
</div>
