<script lang="ts">
	import { disableExtraVisuals } from '../../composables/useDisableTheme';
	import { isDecember } from '../../utils';
</script>

{#if !$disableExtraVisuals && isDecember()}
	<img
		src="/images/xmas_lights.webp"
		alt="Xmas lights"
		aria-hidden="true"
		class="fixed -z-10 w-[400px] rotate-[30deg] -right-[30px] -top-[20px] max-md:hidden"
	/>
{/if}
