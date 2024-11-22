<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	// Data to show in dropdown
	export let data: { img: string; value: string }[] = [];
	// Already guessed values
	export let guessed: string[];
	export let placeholder = 'Enter your guess';
	export let validating: boolean;
	// Size of image to be displayed in the dropdown
	export let imageSize = 3;

	const dispatch = createEventDispatcher<{ select: string }>();

	let value = '';
	let inputElement: HTMLInputElement;
	let selectTimeout = false;
	let sliceAmount = 10;

	$: filteredData = data
		.filter(
			(d) => !guessed.includes(d.value) && d.value.toLowerCase().includes(value.toLowerCase())
		)
		.slice(0, sliceAmount);

	$: showDropdown = value.length > 0 && filteredData.length > 0;

	/**
	 * Handles the select event, dispatching the selected value
	 * @param selected the value selected
	 */
	function handleSelect(selected: string) {
		if (validating || selectTimeout || value === '') return;

		selectTimeout = true;
		dispatch('select', selected);
		value = '';
		inputElement.focus();

		setTimeout(() => {
			selectTimeout = false;
		}, 100);
	}

	/**
	 * Handles and key press.
	 * If esacpe is pressed, hide dropdown.
	 * If enter is pressed, select the first value shown in the dropdown.
	 * @param event the key press event
	 */
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showDropdown = false;
		}

		if (event.key === 'Enter') {
			const data = filteredData[0];
			if (data) {
				handleSelect(data.value);
			}
		}
	}

	/**
	 * Updates the amount of data shown in the dropdown on scroll
	 * (lazy loading data into the dropdown)
	 */
	function handleScroll() {
		if (sliceAmount < data.length) {
			sliceAmount += 10;
		}
	}
</script>

<div class="relative">
	<div class="relative">
		<input
			bind:value
			bind:this={inputElement}
			on:keyup={handleKeyPress}
			class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:rind-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			type="text"
			{placeholder}
			data-testId="input"
		/>
		{#if validating}
			<Loader2 class="animate-spin absolute right-3 top-2 text-muted-foreground" />
		{/if}
	</div>
	{#if showDropdown}
		<ul
			data-testId="dropdown"
			class="dropdown absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-80 overflow-y-auto z-50"
			on:scroll={handleScroll}
		>
			{#each filteredData as d}
				<li class="p-1">
					<button on:click={() => handleSelect(d.value)} class="flex items-center gap-4 p-2 w-full">
						<img
							src={d.img}
							alt={d.value}
							class="img"
							style={`--width: ${imageSize}rem`}
							loading="lazy"
						/>
						<span>{d.value}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style scoped>
	.img {
		width: var(--width, 3rem);
	}
</style>
