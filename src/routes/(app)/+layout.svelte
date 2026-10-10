<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children?: Snippet } = $props();
</script>

<main class="width m-auto">
	{@render children?.()}
</main>

<style>
	.width {
		width: min(100%, 700px);
	}
</style>
