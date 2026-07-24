<script lang="ts">
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { BellOff } from 'lucide-svelte';
	import { muteUpdateNotifications } from '$lib/features/patchNotes';
</script>

<div class="flex gap-4 justify-between">
	<label for="mute-update-notifications" class="flex items-center gap-2"
		><BellOff />Mute update notifications</label
	>
	<Switch id="mute-update-notifications" bind:checked={$muteUpdateNotifications} />
</div>
