<script lang="ts">
	import { disableExtraVisuals } from '../../composables/useDisableTheme';
	import { isWinter } from '../../utils';
</script>

{#if !$disableExtraVisuals && isWinter()}
	<img
		src="/images/snow_pile.webp"
		alt="Snow pile"
		aria-hidden="true"
		class="absolute -top-[35px] rotate-[3deg] right-4 w-[200px]"
	/>
{/if}
