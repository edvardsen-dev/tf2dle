<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

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
	let activeIndex = 0;
	let dropdownDismissed = false;
	let inputId = `guess-input-${Math.random().toString(36).slice(2)}`;
	let listboxId = `${inputId}-listbox`;

	$: normalizedValue = value.trim().toLowerCase();
	$: filteredData = data
		.filter((d) => !guessed.includes(d.value) && d.value.toLowerCase().includes(normalizedValue))
		.slice(0, sliceAmount);
	$: alreadyGuessed = guessed.some((guess) => guess.toLowerCase() === normalizedValue);
	$: hasSearch = normalizedValue.length > 0;
	$: showDropdown = hasSearch && !dropdownDismissed;
	$: activeIndex = Math.min(activeIndex, Math.max(filteredData.length - 1, 0));
	$: activeOptionId = filteredData.length > 0 ? `${listboxId}-option-${activeIndex}` : undefined;

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

	function handleInput() {
		dropdownDismissed = false;
		activeIndex = 0;
		sliceAmount = 10;
	}

	/**
	 * Handles and key press.
	 * If escape is pressed, hide dropdown.
	 * If enter is pressed, select the first value shown in the dropdown.
	 * @param event the key press event
	 */
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dropdownDismissed = true;
			return;
		}

		if (!showDropdown || filteredData.length === 0) {
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % filteredData.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + filteredData.length) % filteredData.length;
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const data = filteredData[activeIndex];
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
			id={inputId}
			bind:value
			bind:this={inputElement}
			on:input={handleInput}
			on:keydown={handleKeyPress}
			class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			type="text"
			{placeholder}
			role="combobox"
			aria-autocomplete="list"
			aria-controls={listboxId}
			aria-expanded={showDropdown}
			aria-activedescendant={activeOptionId}
			aria-busy={validating}
			data-testId="input"
		/>
		{#if validating}
			<Loader2 class="animate-spin absolute right-3 top-2 text-muted-foreground" />
		{/if}
	</div>
	{#if showDropdown}
		<ul
			id={listboxId}
			role="listbox"
			data-testId="dropdown"
			class="dropdown absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-80 overflow-y-auto z-50"
			on:scroll={handleScroll}
		>
			{#if filteredData.length > 0}
				{#each filteredData as d, index}
					<li
						id={`${listboxId}-option-${index}`}
						class="p-1"
						role="option"
						aria-selected={index === activeIndex}
					>
						<button
							on:mouseenter={() => (activeIndex = index)}
							on:click={() => handleSelect(d.value)}
							class="flex items-center gap-4 p-2 w-full rounded-sm text-left {index === activeIndex
								? 'bg-accent text-accent-foreground'
								: ''}"
						>
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
			{:else if alreadyGuessed}
				<li class="px-3 py-3 text-sm text-muted-foreground">Already guessed.</li>
			{:else}
				<li class="px-3 py-3 text-sm text-muted-foreground">No matches found.</li>
			{/if}
		</ul>
	{/if}
</div>

<style scoped>
	.img {
		width: var(--width, 3rem);
	}
</style>
