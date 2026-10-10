<script lang="ts">
	import type { CommandType } from './index.ts';

	let {
		title,
		commands,
		input,
		onselect
	}: {
		title: string;
		commands: CommandType[];
		input: string;
		onselect: (command: CommandType) => void;
	} = $props();

	const filteredCommands = $derived(
		commands.filter((command) =>
			command.keywords.find((keyword) => keyword.toLowerCase().includes(input.toLowerCase()))
		)
	);
</script>

{#if filteredCommands.length > 0}
	<div>
		<h2 class="text-muted-foreground text-xs p-2 font-bold">{title}</h2>
		<div class="text-sm">
			{#each filteredCommands as command}
				<button
					onclick={() => onselect(command)}
					onmouseenter={(event) => event.currentTarget.focus()}
					class="flex items-center gap-2 w-full text-left p-2 focus:outline-none focus:bg-muted rounded"
				>
					<command.icon />
					{command.label}
				</button>
			{/each}
		</div>
	</div>
{/if}
