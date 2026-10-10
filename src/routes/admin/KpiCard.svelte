<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';

	let { label, value }: { label: string; value: string } = $props();
</script>

<Card.Root class="bg-card/90">
	<Card.Header class="pb-2">
		<Card.Description>{label}</Card.Description>
		<Card.Title class="text-3xl tabular-nums">{value}</Card.Title>
	</Card.Header>
</Card.Root>
