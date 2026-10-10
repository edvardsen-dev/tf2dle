<script lang="ts">
	import { type Props } from './index.ts';
	import { cn, pickRandom } from '#lib/utils.ts';
	import { SpeechBubble } from '../speech-bubble/index.ts';
	import { spyQuotes } from './spy-quotes.ts';

	const quote = pickRandom(spyQuotes);

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn('w-full flex flex-row justify-start gap-2 overflow-x-auto', className)}
	{...restProps}
>
	<SpeechBubble arrowSide="right" class="ms-auto">
		{quote}
	</SpeechBubble>
	<img src="/images/404_spy.png" alt="The default main menu Spy from TF2" class="spy-height" />
	{@render children?.()}
</div>

<style>
	.spy-height {
		height: min(40vh, 400px);
	}
</style>
