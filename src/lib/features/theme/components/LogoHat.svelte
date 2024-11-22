<script lang="ts">
	import { disableExtraVisuals } from '../composables/useDisableTheme';
	import { isDecember } from '../utils';
	import XmasHat from './x-mas/XmasHat.svelte';
</script>

{#if !$disableExtraVisuals && isDecember()}
	<div class="absolute w-20 -right-5 rotate-[15deg] -top-7">
		<XmasHat />
	</div>
{/if}
