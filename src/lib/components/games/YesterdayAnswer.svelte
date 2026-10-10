<script lang="ts">
	interface Props {
		challenge: string;
		answer: string | undefined | null;
	}
	let { challenge, answer }: Props = $props();

	let challengeLabel = $derived(challenge.toLowerCase());
</script>

{#if answer}
	<div class="w-full text-center text-xs text-muted-foreground">
		<span>Yesterday's {challengeLabel}:</span>
		<span class="font-medium text-foreground/80">{answer}</span>
	</div>
{/if}
