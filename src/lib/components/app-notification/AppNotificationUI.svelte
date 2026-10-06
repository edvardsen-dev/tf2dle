<script lang="ts">
	import { AlertCircle, AlertTriangle, Info, X } from 'lucide-svelte';
	import { NotificationLevel } from '.';

	export let type: NotificationLevel;
	export let content: string;
	export let onDismiss: () => void;

	const levels = {
		info: {
			icon: Info,
			bg: 'bg-blue-400/10',
			text: 'text-blue-400',
			border: 'border-blue-400'
		},
		warning: {
			icon: AlertTriangle,
			bg: 'bg-yellow-400/10',
			text: 'text-yellow-400',
			border: 'border-yellow-400'
		},
		error: {
			icon: AlertCircle,
			bg: 'bg-red-400/10',
			text: 'text-red-400',
			border: 'border-red-400'
		}
	};

	const activeLevel = levels[type];
</script>

<div class="absolute z-50 left-0 right-0 top-3 flex justify-center px-3">
	<div
		class="flex items-center justify-between gap-2 text-sm border rounded p-2 {activeLevel.border} {activeLevel.bg}"
		style="width: min(700px, 100%)"
	>
		<div class="flex items-center gap-2">
			<svelte:component this={activeLevel.icon} class={activeLevel.text} />
			<p class={activeLevel.text}>{content}</p>
		</div>
		<button on:click={onDismiss}><X class="size-4 {activeLevel.text}" /></button>
	</div>
</div>
