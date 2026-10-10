<script lang="ts">
	import { Palette } from '@lucide/svelte';
	import Switch from '#lib/components/ui/switch/switch.svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { enhance, type SubmitFunction } from '$app/forms';

	let form = $state<HTMLFormElement>();
	let active = $state(false);

	if (browser) {
		const htmlColorblindMode = document.documentElement.dataset.colorblind;
		active = htmlColorblindMode === 'true';
	}

	const submitUpdateColorBlindMode: SubmitFunction = ({ action }) => {
		const colorblindMode = action.searchParams.get('active') === 'true';
		document.documentElement.dataset.colorblind = colorblindMode.toString();
	};

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			form?.requestSubmit();
		}
	}
</script>

<form
	bind:this={form}
	method="POST"
	action="/?/setColorBlindMode&active={active}&redirectTo={page.url.pathname}"
	use:enhance={submitUpdateColorBlindMode}
>
	<div class="flex justify-between">
		<label for="colorblind" class="flex items-center gap-2">
			<Palette class="2-4" />
			Colorblind mode
		</label>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onkeyup={handleKeyUp}>
			<Switch type="submit" id="colorblind" bind:checked={active} />
		</div>
	</div>
</form>
