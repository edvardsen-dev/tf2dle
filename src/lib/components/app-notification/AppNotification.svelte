<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import NotificationBanner from './NotificationBanner.svelte';
	import type { AppNotification } from '$lib/types';

	export let notification: AppNotification | null;
	let className: string | undefined = undefined;
	export { className as class };

	let mounted = false;

	const notificationStore = useLocalStorage(
		'app_notification',
		notification ? { version: notification.version, show: true } : null
	);

	onMount(() => {
		if (notification) {
			const state = $notificationStore;

			if (!state || notification.version > state.version) {
				notificationStore.set({
					version: notification.version,
					show: true
				});
			}
		}

		mounted = true;
	});

	function handleDismissNotification() {
		notificationStore.update((prev) => (prev ? { ...prev, show: false } : prev));
	}
</script>

{#if mounted && notification && $notificationStore?.show}
	<NotificationBanner
		class={className}
		type={notification.type}
		content={notification.content}
		onDismiss={handleDismissNotification}
	/>
{/if}
