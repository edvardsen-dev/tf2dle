<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';

	export let form;
</script>

<main class="mx-auto grid min-h-[55vh] w-full max-w-md content-center px-4">
	<Card.Root class="border-primary/30 bg-card/95 shadow-2xl shadow-black/40">
		<Card.Header>
			<Card.Title class="text-2xl">Admin login</Card.Title>
			<Card.Description
				>Enter the dashboard password to view private usage metrics.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form method="POST" class="grid gap-4">
				<label class="grid gap-2 text-sm font-medium">
					Password
					<input
						class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						name="password"
						type="password"
						autocomplete="current-password"
						required
					/>
				</label>

				{#if form?.message}
					<p
						class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						{form.message}
					</p>
				{/if}

				<Button type="submit" class="w-full">Open dashboard</Button>
			</form>
		</Card.Content>
	</Card.Root>
</main>
