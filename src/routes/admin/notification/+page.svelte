<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { NotificationBanner } from '#lib/components/app-notification/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import * as Card from '#lib/components/ui/card/index.ts';
	import { NotificationLevel } from '#lib/types.ts';
	import { AlertCircle, CheckCircle2, Loader2 } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types.js';

	let { data, form }: Pick<PageProps, 'data' | 'form'> = $props();

	let type = $state<NotificationLevel>(
		untrack(() => (data.notification?.type as NotificationLevel) ?? NotificationLevel.INFO)
	);
	let content = $state(untrack(() => data.notification?.content ?? ''));

	let showSuccess = $state(false);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let toggleError = $state<string | null>(null);
	let pendingEnabled = $state<boolean | null>(null);

	const enabled = $derived(pendingEnabled ?? data.notification?.enabled ?? false);
	const hasChanges = $derived(
		data.notification?.content !== content || data.notification?.type !== type
	);
	const contentValid = $derived(content.trim().length > 0 && content.length <= 500);
	const updateError = $derived(
		saving ? null : (saveError ?? (form?.action === 'update' ? form.message : null))
	);
	const activeStateError = $derived(
		pendingEnabled !== null
			? null
			: (toggleError ?? (form?.action === 'setActiveState' ? form.message : null))
	);

	const saveNotification: SubmitFunction = () => {
		saving = true;
		saveError = null;
		showSuccess = false;

		return async ({ result, update }) => {
			try {
				if (result.type === 'error') {
					saveError =
						'Could not save the notification. Your edits are still here. Please try again.';
					return;
				}
				await update({ reset: false });
			} finally {
				saving = false;
			}
		};
	};

	const toggleNotification: SubmitFunction = () => {
		pendingEnabled = !enabled;
		toggleError = null;

		return async ({ result, update }) => {
			try {
				if (result.type === 'error') {
					toggleError =
						'Could not change visibility. The previous setting was restored. Please try again.';
					return;
				}
				await update({ reset: false });
			} finally {
				pendingEnabled = null;
			}
		};
	};

	$effect(() => {
		const succeeded = form?.action === 'update' && form?.success === true;
		showSuccess = succeeded;
		if (!succeeded) return;
		const timeout = setTimeout(() => {
			showSuccess = false;
		}, 3000);
		return () => clearTimeout(timeout);
	});
</script>

<main class="mx-auto grid w-full max-w-7xl gap-6 px-4">
	<section
		class="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-border bg-card/90 p-4"
	>
		<div class="space-y-1">
			<h1 class="text-xl font-semibold">App notification</h1>
			<p class="text-sm text-muted-foreground">
				Manage the banner shown to visitors across the app.
			</p>
		</div>
		<form
			class="grid gap-3 sm:max-w-sm"
			method="POST"
			action="?/setActiveState"
			use:enhance={toggleNotification}
		>
			<input type="hidden" name="enabled" value={enabled ? 'false' : 'true'} />
			<div class="flex items-center gap-3">
				<button
					type="submit"
					role="switch"
					aria-checked={enabled}
					aria-labelledby="notification-enabled-label"
					aria-describedby="notification-visibility-description"
					aria-busy={pendingEnabled !== null}
					disabled={!data.notification || pendingEnabled !== null || saving}
					data-state={enabled ? 'checked' : 'unchecked'}
					class="group inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input motion-reduce:transition-none"
				>
					<span
						aria-hidden="true"
						class="h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-150 ease-out group-data-[state=checked]:translate-x-5 motion-reduce:transition-none"
					></span>
				</button>
				<div>
					<span id="notification-enabled-label" class="block text-sm font-medium">Enabled</span>
					<p
						id="notification-visibility-description"
						class="text-xs text-muted-foreground"
						aria-live="polite"
					>
						{#if !data.notification}
							Save a notification before enabling it.
						{/if}
					</p>
				</div>
			</div>
			{#if activeStateError}
				<div
					role="alert"
					class="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
				>
					<AlertCircle size={16} class="mt-0.5 shrink-0" aria-hidden="true" />
					<p>{activeStateError}</p>
				</div>
			{/if}
		</form>
	</section>

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
		<Card.Root class="min-w-0 bg-card/90">
			<Card.Header>
				<Card.Title tag="h2">Message</Card.Title>
				<Card.Description>Choose a type and write a short announcement.</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/update"
					use:enhance={saveNotification}
					class="grid gap-5"
					aria-busy={saving}
				>
					<label class="grid gap-2 text-sm font-medium">
						Type *
						<select
							name="type"
							bind:value={type}
							required
							class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:w-48"
						>
							<option value={NotificationLevel.INFO}>Info</option>
							<option value={NotificationLevel.WARNING}>Warning</option>
							<option value={NotificationLevel.ERROR}>Error</option>
						</select>
					</label>
					<div class="grid gap-2">
						<label for="notification-content" class="text-sm font-medium">Content *</label>
						<textarea
							id="notification-content"
							name="content"
							rows="5"
							maxlength="500"
							bind:value={content}
							required
							aria-describedby="notification-content-help"
							class="min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
						></textarea>
						<div
							id="notification-content-help"
							class="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"
						>
							<span>Required. Up to 500 characters.</span>
							<span class="tabular-nums">{content.length} / 500</span>
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-3 border-t border-border pt-5">
						<Button
							type="submit"
							disabled={enabled ||
								!contentValid ||
								!hasChanges ||
								saving ||
								pendingEnabled !== null}
							aria-describedby="notification-save-description"
							class="gap-2"
						>
							{#if saving}<Loader2
									size={16}
									class="animate-spin motion-reduce:animate-none"
									aria-hidden="true"
								/>{/if}
							{saving ? 'Saving...' : 'Save notification'}
						</Button>
						<p
							id="notification-save-description"
							class="text-xs text-muted-foreground"
							aria-live="polite"
						>
							{#if enabled}Disable the notification before saving changes.
							{:else if !contentValid}Enter a message to save.
							{:else if hasChanges}You have unsaved changes.
							{:else}All changes saved.{/if}
						</p>
					</div>
					{#if updateError}
						<div
							role="alert"
							class="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<AlertCircle size={18} class="mt-0.5 shrink-0" aria-hidden="true" />
							<div class="space-y-1">
								<p class="font-medium">Notification not saved</p>
								<p>{updateError}</p>
							</div>
						</div>
					{:else if showSuccess}
						<div
							role="status"
							class="flex items-start gap-3 rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400"
						>
							<CheckCircle2 size={18} class="mt-0.5 shrink-0" aria-hidden="true" />
							<p class="font-medium">Notification saved.</p>
						</div>
					{/if}
				</form>
			</Card.Content>
		</Card.Root>

		<Card.Root class="min-w-0 bg-card/90">
			<Card.Header>
				<Card.Title tag="h2">Preview</Card.Title>
				<Card.Description
					>Updates as you edit. Only saved content is shown to visitors.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				{#if type && content.trim()}
					<NotificationBanner {type} {content} class="w-full shadow-none" onDismiss={() => {}} />
				{:else}
					<div
						class="grid min-h-36 place-content-center gap-1 rounded-lg border border-dashed border-border p-6 text-center"
					>
						<p class="text-sm font-medium">Your message will appear here</p>
						<p class="text-sm text-muted-foreground">Start typing to preview the notification.</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
