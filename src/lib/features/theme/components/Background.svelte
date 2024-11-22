<script lang="ts">
	import { onMount } from 'svelte';
	import { isDecember } from '../utils';
	import { browser } from '$app/environment';

	$: backgroundImg = isDecember() ? '/images/tf2_xmas.webp' : '/images/tf2.jpg';

	onMount(() => {
		if (browser) {
			document.body.style.backgroundImage = `linear-gradient(rgba(0 0 0 / 0.7), rgba(0 0 0 / 1)), url('${backgroundImg}')`;
		}
	});
</script>
