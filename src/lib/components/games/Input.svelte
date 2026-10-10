<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	interface Props {
		data?: { img: string; value: string }[];
		guessed: string[];
		placeholder?: string;
		validating: boolean;
		imageSize?: number;
		onselect: (value: string) => void;
	}

	let {
		data = [],
		guessed,
		placeholder = 'Enter your guess',
		validating,
		imageSize = 3,
		onselect
	}: Props = $props();

	let value = $state('');
	let inputElement = $state.raw<HTMLInputElement>();
	let selectTimeout = $state(false);
	let selectTimer: ReturnType<typeof setTimeout> | undefined;
	let sliceAmount = $state(10);
	let activeIndex = $state(0);
	let dropdownDismissed = $state(false);
	const id = $props.id();
	const inputId = `guess-input-${id}`;
	const listboxId = `${inputId}-listbox`;

	let normalizedValue = $derived(value.trim().toLowerCase());
	let filteredData = $derived(
		data
			.filter((d) => !guessed.includes(d.value) && d.value.toLowerCase().includes(normalizedValue))
			.slice(0, sliceAmount)
	);
	let alreadyGuessed = $derived(guessed.some((guess) => guess.toLowerCase() === normalizedValue));
	let hasSearch = $derived(normalizedValue.length > 0);
	let showDropdown = $derived(hasSearch && !dropdownDismissed);
	let selectedIndex = $derived(Math.min(activeIndex, Math.max(filteredData.length - 1, 0)));
	let activeOptionId = $derived(
		filteredData.length > 0 ? `${listboxId}-option-${selectedIndex}` : undefined
	);

	onDestroy(() => clearTimeout(selectTimer));

	/**
	 * Handles the selected value
	 * @param selected the value selected
	 */
	function handleSelect(selected: string) {
		if (validating || selectTimeout || value === '') return;

		selectTimeout = true;
		onselect(selected);
		value = '';
		inputElement?.focus();

		selectTimer = setTimeout(() => {
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
			activeIndex = (selectedIndex + 1) % filteredData.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (selectedIndex - 1 + filteredData.length) % filteredData.length;
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const data = filteredData[selectedIndex];
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
			oninput={handleInput}
			onkeydown={handleKeyPress}
			class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			type="text"
			{placeholder}
			aria-label={placeholder}
			role="combobox"
			aria-autocomplete="list"
			aria-controls={listboxId}
			aria-expanded={showDropdown}
			aria-activedescendant={activeOptionId}
			aria-busy={validating}
			data-testId="input"
		/>
		{#if validating}
			<LoaderCircle class="animate-spin absolute right-3 top-2 text-muted-foreground" />
		{/if}
	</div>
	{#if showDropdown}
		<ul
			id={listboxId}
			role="listbox"
			data-testId="dropdown"
			class="dropdown absolute bg-background w-full border border-input ring-offset-background rounded-md max-h-80 overflow-y-auto z-50"
			onscroll={handleScroll}
		>
			{#if filteredData.length > 0}
				{#each filteredData as d, index}
					<li
						id={`${listboxId}-option-${index}`}
						class="p-1"
						role="option"
						aria-selected={index === selectedIndex}
					>
						<button
							onmouseenter={() => (activeIndex = index)}
							onclick={() => handleSelect(d.value)}
							class="flex items-center gap-4 p-2 w-full rounded-sm text-left {index ===
							selectedIndex
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
