<script lang="ts">
	export let challenge: string;
	export let answer: string | undefined | null;

	$: challengeLabel = challenge.toLowerCase();
</script>

{#if answer}
	<div class="w-full text-center text-xs text-muted-foreground">
		<span>Yesterday's {challengeLabel}:</span>
		<span class="font-medium text-foreground/80">{answer}</span>
	</div>
{/if}
