<script lang="ts">
	import { onMount } from 'svelte';
	import { isDecember, isHalloween } from '../utils';
	import { browser } from '$app/environment';

	$: backgroundImage = getBackgroundImage();

	function getBackgroundImage() {
		if (isHalloween()) {
			return `radial-gradient(circle at 80% 10%, rgba(115, 48, 160, 0.28), transparent 22rem), radial-gradient(circle at 16% 82%, rgba(234, 88, 12, 0.22), transparent 24rem), linear-gradient(rgba(14, 4, 23, 0.78), rgba(0, 0, 0, 1)), url('/images/tf2.jpg')`;
		}

		if (isDecember()) {
			return `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 1)), url('/images/tf2_xmas.webp')`;
		}

		return `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 1)), url('/images/tf2.jpg')`;
	}

	onMount(() => {
		if (browser) {
			document.body.style.backgroundImage = backgroundImage;

			if (isHalloween()) {
				document.documentElement.dataset.season = 'halloween';
			} else {
				delete document.documentElement.dataset.season;
			}
		}
	});
</script>
