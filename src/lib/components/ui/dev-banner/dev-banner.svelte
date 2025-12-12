<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';
</script>

{#if import.meta.env.DEV}
	<p class="absolute bottom-0 right-0 px-4 pl-6 py-1 bg-primary rounded-tl-full">Development</p>
{/if}
