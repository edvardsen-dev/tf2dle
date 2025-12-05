<script lang="ts">
    import { type Props } from '.';
    import { cn, pickRandom } from '$lib/utils';
	import { SpeechBubble } from '../speech-bubble';
	import { spyQuotes } from './spy-quotes';

    type $$Props = Props;
    
    const quote = pickRandom(spyQuotes);

    let className: $$Props['class'] = undefined;
    export { className as class };
</script>

            
<div 
    class={cn('w-full flex flex-row justify-end gap-2', className)}
	{...$$restProps}
>
    <SpeechBubble arrowSide="right">
        {quote}
    </SpeechBubble>
    <img 
        src="/images/404_spy.png"
        alt="The default main menu Spy from TF2"
        class="spy-height"
        />
</div>


<style scoped>
    .spy-height {
        height: min(40vh, 400px);
    }
</style>
