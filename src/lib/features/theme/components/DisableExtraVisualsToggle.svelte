<script lang="ts">
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import { EyeOff } from 'lucide-svelte';
	import { disableExtraVisuals } from '../composables/useDisableTheme';
</script>

<div class="flex gap-4 justify-between">
	<label for="disable-extra-visuals" class="flex items-center gap-2"
		><EyeOff />Disable extra visuals</label
	>
	<Switch id="disable-extra-visuals" bind:checked={$disableExtraVisuals} />
</div>
