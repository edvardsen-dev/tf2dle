<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Settings } from 'lucide-svelte';
	import { buttonVariants } from './ui/button';
	import ColorblindModeToggler from './ColorblindModeToggler.svelte';
	import Button from './ui/button/button.svelte';
	import { type UseStats } from '$lib/composables/useStats';
	import { toast } from 'svelte-sonner';
	import { openSettings } from '$lib/stores/settings';
	import { gameModes } from '$lib/game-modes';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import DisableExtraVisualsToggle from '$lib/features/theme/components/DisableExtraVisualsToggle.svelte';

	function clearStat(gamemode: string, stat: UseStats) {
		stat.clearStats();
		toast.success(`Stats related to the ${gamemode} gamemode has been deleted!`);
	}

	function clearAllStats() {
		gameModes.forEach((gamemode) => {
			gamemode.stats.clearStats();
		});
		toast.success('All stats have been deleted!');
	}
</script>

<Dialog.Root bind:open={$openSettings}>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<Settings class="text-muted-foreground" />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Settings</Dialog.Title>
		<Dialog.Description>Change your settings here</Dialog.Description>
		<div class="grid gap-8 py-4">
			<div class="grid gap-4">
				<h2 class="text-muted-foreground text-sm">Accessibility</h2>
				<ColorblindModeToggler />
				<DisableExtraVisualsToggle />
			</div>
			<div class="grid gap-2">
				<h2 class="text-muted-foreground text-sm">Local Data</h2>
				{#each gameModes as gamemode}
					{@const lowerCaseName = gamemode.name.toLowerCase()}
					<div class="flex justify-between items-center">
						<p class="flex items-center gap-2">
							<svelte:component this={gamemode.icon} />
							<span>{gamemode.name}</span>
						</p>
						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button builders={[builder]} variant="outline">Clear</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Clear {lowerCaseName} stats</AlertDialog.Title>
									<AlertDialog.Description>
										Are you sure you want to clear all stats related to the {lowerCaseName} gamemode?
										This action cannot be undone!
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action on:click={() => clearStat(lowerCaseName, gamemode.stats)}
										>Clear stats</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</div>
				{/each}
				<AlertDialog.Root>
					<AlertDialog.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline" class="w-full">Clear all</Button>
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Clear stats</AlertDialog.Title>
							<AlertDialog.Description>
								Are you sure you want to clear all stats? This action cannot be undone!
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action on:click={clearAllStats}>Clear all</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
