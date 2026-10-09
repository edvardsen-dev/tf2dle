<script lang="ts">
	import { AlertCircle, AlertTriangle, Megaphone, X } from 'lucide-svelte';
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
			icon: Megaphone,
			label: 'Announcement',
			text: 'text-orange-700 dark:text-orange-400',
			border: 'border-primary/50'
		},
		warning: {
			icon: AlertTriangle,
			label: 'Heads up',
			text: 'text-amber-700 dark:text-amber-400',
			border: 'border-amber-500/50'
		},
		error: {
			icon: AlertCircle,
			label: 'Important notice',
			text: 'text-red-700 dark:text-red-400',
			border: 'border-destructive/50'
		}
	};

	$: activeLevel = levels[type];
</script>

<div
	class={cn(
		'flex items-start gap-3 rounded-sm border-2 bg-secondary px-4 py-4 text-secondary-foreground sm:px-5',
		activeLevel.border,
		className
	)}
>
	<div
		role={type === NotificationLevel.ERROR ? 'alert' : 'status'}
		class="min-w-0 flex-1 space-y-2"
	>
		<p
			class="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-widest {activeLevel.text}"
		>
			<svelte:component this={activeLevel.icon} class="h-5 w-5 shrink-0" aria-hidden="true" />
			{activeLevel.label}
		</p>
		<p class="break-words text-base font-medium leading-relaxed">{content}</p>
	</div>
	<Button
		type="button"
		variant="ghost"
		size="icon"
		class="-mr-2 -mt-2 shrink-0 text-muted-foreground"
		on:click={onDismiss}
		aria-label="Dismiss notification"
	>
		<X class="h-4 w-4" aria-hidden="true" />
	</Button>
</div>
