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
	import MuteUpdateNotificationsToggle from '$lib/features/patchNotes/components/mute-update-notifications-toggle.svelte';
	import HideTimerToggle from '$lib/components/HideTimerToggle.svelte';

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
	<Dialog.Content class="max-h-[90vh] max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-xl">
		<div class="border-b bg-muted/40 px-6 py-5 pr-12">
			<Dialog.Title class="flex items-center gap-2 text-2xl">
				<Settings class="h-5 w-5 text-primary" />
				Settings
			</Dialog.Title>
			<Dialog.Description class="mt-2 max-w-xl">
				Change gameplay preferences, notification settings, and locally saved stats.
			</Dialog.Description>
		</div>

		<div
			class="grid max-h-[calc(90vh-8rem)] gap-4 overflow-y-auto p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)]"
		>
			<div class="grid content-start gap-4">
				<section class="rounded-xl border bg-card/70 p-4 shadow-sm">
					<div class="mb-4">
						<h2 class="font-semibold leading-none">Accessibility</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Adjust the interface for easier reading.
						</p>
					</div>
					<div class="grid gap-4">
						<ColorblindModeToggler />
						<DisableExtraVisualsToggle />
						<HideTimerToggle />
					</div>
				</section>

				<section class="rounded-xl border bg-card/70 p-4 shadow-sm">
					<div class="mb-4">
						<h2 class="font-semibold leading-none">Notifications</h2>
						<p class="mt-1 text-sm text-muted-foreground">Control badges and update reminders.</p>
					</div>
					<MuteUpdateNotificationsToggle />
				</section>
			</div>

			<section class="rounded-xl border bg-card/70 p-4 shadow-sm">
				<div class="mb-4">
					<h2 class="font-semibold leading-none">Local Data</h2>
					<p class="mt-1 text-sm text-muted-foreground">Clear saved stats per game mode.</p>
				</div>
				<div class="grid gap-2">
					{#each gameModes as gamemode}
						{@const lowerCaseName = gamemode.name.toLowerCase()}
						<div
							class="flex items-center justify-between gap-3 rounded-lg border bg-background/70 p-2.5"
						>
							<p class="flex min-w-0 items-center gap-2.5 font-medium">
								<span
									class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"
								>
									<svelte:component this={gamemode.icon} class="h-4 w-4" />
								</span>
								<span>{gamemode.name}</span>
							</p>
							<AlertDialog.Root>
								<AlertDialog.Trigger asChild let:builder>
									<Button builders={[builder]} variant="outline" size="sm">Clear</Button>
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
				</div>
				<AlertDialog.Root>
					<AlertDialog.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline" class="mt-4 w-full"
							>Clear all stats</Button
						>
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
			</section>
		</div>
	</Dialog.Content>
</Dialog.Root>
