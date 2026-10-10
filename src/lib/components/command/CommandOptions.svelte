<script lang="ts">
	import type { CommandOption } from './index.ts';
	import { ChevronLeft } from '@lucide/svelte';

	let {
		title = '',
		options,
		input,
		onselect,
		onback
	}: {
		title?: string;
		options: CommandOption[];
		input: string;
		onselect: (option: CommandOption) => void;
		onback: () => void;
	} = $props();

	const filteredOptions = $derived(
		options.filter((option) => option.label.toLowerCase().includes(input.toLowerCase()))
	);

	const searchIncludesBack = $derived('back'.includes(input.toLowerCase()));
</script>

{#if filteredOptions.length > 0 || searchIncludesBack}
	<div>
		<h2 class="text-muted-foreground text-xs p-2">{title}</h2>
		<div class="text-sm">
			{#each filteredOptions as option (option.label)}
				<button
					onclick={() => onselect(option)}
					class="flex items-center gap-2 w-full text-left p-2 focus:outline-none focus:bg-muted rounded"
				>
					<option.icon />
					{option.label}
				</button>
			{/each}
			<button
				onclick={onback}
				class="flex items-center gap-2 w-full text-left p-2 focus:outline-none focus:bg-muted rounded"
			>
				<ChevronLeft />
				Back
			</button>
		</div>
	</div>
{/if}
