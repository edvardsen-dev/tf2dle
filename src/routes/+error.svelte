<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import WinterDecore from '$lib/features/theme/components/winter/WinterDecore.svelte';
	
    import { page } from '$app/state';
	import { SpySpeaking } from '$lib/components/ui/spy-speaking';

    const status: number = page.status;
    const error: App.Error | null | undefined = page.error;
</script>

<div class="width m-auto">
    <Card.Root class="relative">
        <Card.Header>
            {#if status === 404}
                <Card.Title>404</Card.Title>
                <Card.Description>Not found </Card.Description>
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
            <a
                href='/'
                class="block relative overflow-hidden hover:scale-[1.02] transition-transform"
            >
                <div class="flex w-full justify-center gap-4 bg-secondary rounded px-4 py-2">
                    <p class="font-semibold">Abort!</p>
                </div>
            </a>           
        </Card.Content>
    </Card.Root>
</div>

<style scoped>
	.width {
		width: min(100%, 700px);
	}
</style>
