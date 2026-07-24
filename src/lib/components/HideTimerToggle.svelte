<script lang="ts">
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { TimerOff } from 'lucide-svelte';
	import { hideResetTimer } from '$lib/stores/settings';
</script>

<div class="flex gap-4 justify-between">
	<label for="hide-reset-timer" class="flex items-center gap-2"><TimerOff />Hide reset timer</label>
	<Switch id="hide-reset-timer" bind:checked={$hideResetTimer} />
</div>
