<script lang="ts">
	import { NotificationBanner } from '$lib/components/app-notification';
	import { Button } from '$lib/components/ui/button';
	import { NotificationLevel } from '$lib/types';

	export let data;

	let type: NotificationLevel =
		(data.notification?.type as NotificationLevel) ?? NotificationLevel.INFO;
	let content: string = data.notification?.content ?? '';
</script>

<main class="mx-auto max-w-2xl space-y-6 px-4">
	<h1 class="text-xl font-semibold">App notification</h1>

	<form method="POST" action="?/update" class="grid gap-4">
		<label class="grid gap-2 text-sm font-medium">
			Type *
			<select
				name="type"
				bind:value={type}
				required
				class="h-10 w-fit rounded-md border border-input bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
			>
				<option value={NotificationLevel.INFO}>Info</option>
				<option value={NotificationLevel.WARNING}>Warning</option>
				<option value={NotificationLevel.ERROR}>Error</option>
			</select>
		</label>
		<label class="grid gap-2 text-sm font-medium">
			Content *
			<textarea
				name="content"
				rows="3"
				bind:value={content}
				required
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
			></textarea>
		</label>
		<Button
			type="submit"
			disabled={data.notification?.content === content && data.notification?.type === type}
			class="w-fit">Save</Button
		>
	</form>

	<form method="POST" action="?/setEnabled" class="flex items-center gap-3 border-t pt-4">
		<input type="hidden" name="enabled" value={data.notification?.enabled ? 'false' : 'true'} />
		<button
			type="submit"
			role="switch"
			aria-checked={data.notification?.enabled ?? false}
			aria-labelledby="notification-enabled-label"
			disabled={!data.notification}
			data-state={data.notification?.enabled ? 'checked' : 'unchecked'}
			class="group inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
		>
			<span
				aria-hidden="true"
				class="h-5 w-5 rounded-full bg-background group-data-[state=checked]:translate-x-5"
			></span>
		</button>
		<span id="notification-enabled-label" class="text-sm">Enabled</span>
		{#if !data.notification}
			<span class="text-sm text-muted-foreground">Save a notification first.</span>
		{/if}
	</form>

	<section class="space-y-3">
		<h2 class="text-sm font-medium">Preview</h2>
		{#if type && content}
			<NotificationBanner {type} {content} onDismiss={() => {}} />
		{:else}
			<p class="text-sm text-muted-foreground">No notification to preview.</p>
		{/if}
	</section>
</main>
