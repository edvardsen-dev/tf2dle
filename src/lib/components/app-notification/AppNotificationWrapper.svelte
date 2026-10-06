<script lang="ts">
	import { useLocalStorage } from '$lib/composables/useLocalStorage';
	import { onMount } from 'svelte';
	import { NotificationLevel } from '.';
	import AppNotificationUI from './AppNotificationUI.svelte';

	const notification = {
		version: 3,
		type: NotificationLevel.WARNING,
		content: 'There is on-going maintanence, the page might be down for a few minutes...'
	};

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
	<AppNotificationUI
		type={notification.type}
		content={notification.content}
		onDismiss={handleDismissNotification}
	/>
{/if}
