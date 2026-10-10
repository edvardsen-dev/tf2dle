<script lang="ts">
	import { disableExtraVisuals } from '../composables/useDisableTheme.ts';
	import { isDecember, isHalloween } from '../utils.ts';
	import HalloweenLogoDecor from './halloween/HalloweenLogoDecor.svelte';
	import XmasHat from './x-mas/XmasHat.svelte';
</script>

{#if !$disableExtraVisuals && isDecember()}
	<div class="absolute w-20 -right-5 rotate-[15deg] -top-7">
		<XmasHat />
	</div>
{:else if !$disableExtraVisuals && isHalloween()}
	<div class="absolute w-20 -right-7 rotate-[12deg] -top-8">
		<HalloweenLogoDecor />
	</div>
{/if}
