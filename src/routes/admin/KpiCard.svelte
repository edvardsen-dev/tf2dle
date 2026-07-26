<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	export let label: string;
	export let value: string;
</script>

<Card.Root class="bg-card/90">
	<Card.Header class="pb-2">
		<Card.Description>{label}</Card.Description>
		<Card.Title class="text-3xl tabular-nums">{value}</Card.Title>
	</Card.Header>
</Card.Root>
