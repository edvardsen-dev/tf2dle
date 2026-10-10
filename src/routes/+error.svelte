<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.ts';
	import WinterDecore from '#lib/features/theme/components/winter/WinterDecore.svelte';

	import { page } from '$app/state';
	import { SpySpeaking } from '#lib/components/ui/spy-speaking/index.ts';
	import Button from '#lib/components/ui/button/button.svelte';

	const status = $derived(page.status);
	const error = $derived(page.error);
</script>

<div class="width m-auto">
	<Card.Root class="relative">
		<Card.Header>
			{#if status === 404}
				<Card.Title>404</Card.Title>
				<Card.Description>Not found</Card.Description>
			{:else if error}
				<Card.Title>Error {status}</Card.Title>
				<Card.Description>{error.message ?? 'An unknown error occurred.'}</Card.Description>
			{:else}
				<Card.Title>Error {status}</Card.Title>
				<Card.Description>An unexpected error occurred.</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content>
			<WinterDecore />
			<SpySpeaking />

			<Button href={'/'} class="mb-2 w-full" variant="secondary">Abort!</Button>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.width {
		width: min(100%, 700px);
	}
</style>
