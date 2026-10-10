<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import { onMount, untrack } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Command as CommandIcon, Search } from '@lucide/svelte';
	import { commandGroups, type CommandOption, type CommandType } from './index.ts';
	import CommandGroup from './CommandGroup.svelte';
	import CommandOptions from './CommandOptions.svelte';

	const keypressRegex = /^[a-zA-Z0-9]$/;

	type ActionFunction = (...args: any[]) => any;

	let inputEl = $state<HTMLInputElement>();
	let input = $state('');
	let open = $state(false);
	let selectedCommand = $state.raw<CommandType | null>(null);
	let options = $state.raw<CommandOption[] | null>(null);

	$effect(() => {
		if (!open) untrack(reset);
	});

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}

			if (open && keypressRegex.test(e.key)) {
				inputEl?.focus();
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleSelect(command: CommandType) {
		if (command.options) {
			selectedCommand = command;
			input = '';
			options = command.options;
		} else {
			doAction(command.action);
		}
	}

	function doAction<T extends ActionFunction>(action: T, ...args: Parameters<T>) {
		if (action) {
			action(...args);
		}

		reset();
	}

	function reset() {
		input = '';
		open = false;
		selectedCommand = null;
		options = null;
	}

	function navToStart() {
		input = '';
		selectedCommand = null;
		options = null;
	}
</script>

<Button
	onclick={() => (open = !open)}
	variant="outline"
	class="absolute top-2 left-2 flex gap-2 items-center justify-between text-muted-foreground w-[230px] text-xs"
>
	<div class="flex items-center gap-2">Quick commands...</div>
	<kbd class="flex gap-1 items-center bg-neutral-800 px-2 py-1 rounded">
		<CommandIcon class="w-4 h-4" />
		K
	</kbd>
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-0 gap-0">
		<Dialog.Title class="sr-only">Quick commands</Dialog.Title>
		<Dialog.Description class="sr-only"
			>Search for a command or choose an action below.</Dialog.Description
		>
		<!-- Command search -->
		<div class="flex p-4 border-b gap-2 text-sm items-center">
			<Search class="w-4 h-4" />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				aria-label="Search commands"
				bind:value={input}
				bind:this={inputEl}
				autofocus
				placeholder="Type a command..."
				class="bg-transparent focus:outline-none"
			/>
		</div>
		<div class="p-1">
			{#if options !== null}
				<CommandOptions
					onselect={(option) =>
						selectedCommand
							? doAction(selectedCommand.action, option.value)
							: console.error(`No action abailable. Option choosen: ${option.value}`)}
					onback={navToStart}
					title={selectedCommand?.label}
					{options}
					{input}
				/>
			{:else}
				{#each commandGroups as group}
					<CommandGroup
						onselect={handleSelect}
						title={group.title}
						commands={group.commands}
						{input}
					/>
				{/each}
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
