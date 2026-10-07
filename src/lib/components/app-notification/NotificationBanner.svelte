<script lang="ts">
	import { AlertCircle, AlertTriangle, Info, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { NotificationLevel } from '$lib/types';
	import { cn } from '$lib/utils';

	export let type: NotificationLevel;
	export let content: string;
	export let onDismiss: () => void;
	let className: string | undefined = undefined;
	export { className as class };

	const levels = {
		info: {
			icon: Info,
			label: 'Announcement',
			bg: 'bg-blue-400/10',
			text: 'text-blue-400',
			border: 'border-l-blue-400/70'
		},
		warning: {
			icon: AlertTriangle,
			label: 'Heads up',
			bg: 'bg-amber-400/10',
			text: 'text-amber-400',
			border: 'border-l-amber-400/70'
		},
		error: {
			icon: AlertCircle,
			label: 'Important notice',
			bg: 'bg-red-400/10',
			text: 'text-red-400',
			border: 'border-l-destructive/70'
		}
	};

	$: activeLevel = levels[type];
</script>

<div
	class={cn(
		'relative flex items-start gap-3 rounded-lg border border-l-[3px] bg-card/95 p-3 text-card-foreground shadow-lg backdrop-blur-sm sm:p-4',
		activeLevel.border,
		className
	)}
>
	<div
		role={type === NotificationLevel.ERROR ? 'alert' : 'status'}
		class="flex min-w-0 flex-1 items-start gap-3"
	>
		<span
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md {activeLevel.bg} {activeLevel.text}"
		>
			<svelte:component this={activeLevel.icon} class="h-5 w-5" aria-hidden="true" />
		</span>
		<div class="min-w-0 flex-1 space-y-1 py-0.5">
			<p class="text-sm font-semibold">{activeLevel.label}</p>
			<p class="break-words text-sm leading-relaxed text-muted-foreground">{content}</p>
		</div>
	</div>
	<Button
		type="button"
		variant="ghost"
		size="icon"
		class="shrink-0 text-muted-foreground"
		on:click={onDismiss}
		aria-label="Dismiss notification"
	>
		<X class="h-4 w-4" aria-hidden="true" />
	</Button>
</div>
