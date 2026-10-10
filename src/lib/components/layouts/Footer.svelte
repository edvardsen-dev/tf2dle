<script lang="ts">
	import { PUBLIC_APP_VERSION } from '$app/env/public';
	import { DATA_LAST_UPDATED_DISPLAY } from '#lib/appMetadata.ts';
	import dayjs from '#lib/configs/dayjsConfig.ts';
	import { hideResetTimer } from '#lib/stores/settings.ts';
	import { getGameModeResetTime } from '#lib/utils/reset.ts';
	import { onMount } from 'svelte';

	const appVersion = PUBLIC_APP_VERSION || 'dev';
	const appVersionLabel = `v${appVersion}`;
	const releaseUrl =
		appVersion === 'dev'
			? undefined
			: `https://github.com/edvardsen-dev/tf2dle/releases/tag/${appVersion}`;

	let timeTilReset = $state.raw(initializeResetTime());

	const hours = $derived(
		timeTilReset.hours() < 10 ? `0${timeTilReset.hours()}` : timeTilReset.hours()
	);
	const minutes = $derived(
		timeTilReset.minutes() < 10 ? `0${timeTilReset.minutes()}` : timeTilReset.minutes()
	);
	const seconds = $derived(
		timeTilReset.seconds() < 10 ? `0${timeTilReset.seconds()}` : timeTilReset.seconds()
	);

	onMount(() => {
		timeTilReset = initializeResetTime();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	});

	function initializeResetTime() {
		const now = dayjs().local();
		const resetTime = getGameModeResetTime();

		const diff = resetTime.diff(now);

		return dayjs.duration(diff);
	}

	function updateTimer() {
		if (timeTilReset.asSeconds() <= 0) {
			timeTilReset = initializeResetTime();
		}
		timeTilReset = timeTilReset.subtract(1, 'second');
	}
</script>

<footer class="width m-auto text-center text-xs text-muted-foreground/75">
	<div class:invisible={$hideResetTimer} class="mb-5" aria-hidden={$hideResetTimer}>
		<p class="mb-1 uppercase tracking-[0.2em] text-muted-foreground/60">Games reset in</p>
		<p class="text-3xl font-semibold tabular-nums text-foreground" data-testId="timer">
			{hours}:{minutes}:{seconds}
		</p>
	</div>

	<div class="grid gap-2 border-t pt-4 sm:grid-cols-[1fr_auto] sm:items-center sm:text-left">
		<p>
			Made by
			<a href="https://edvardsen.dev" target="_blank" rel="noreferrer" class="footer-link"
				>Joakim Edvardsen</a
			>
		</p>

		<nav
			class="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:justify-end"
			aria-label="Footer links"
		>
			<a
				href="https://www.buymeacoffee.com/joakimedvam"
				target="_blank"
				rel="noreferrer"
				class="footer-link">Support</a
			>
			<a
				href="https://www.reddit.com/user/jaakim"
				target="_blank"
				rel="noreferrer"
				class="footer-link">Report a bug</a
			>
			<a
				href="https://github.com/edvardsen-dev/tf2dle"
				target="_blank"
				rel="noreferrer"
				class="footer-link">Contribute</a
			>
		</nav>

		<p class="sm:col-span-2">
			Version:
			{#if releaseUrl}
				<a href={releaseUrl} target="_blank" rel="noreferrer" class="footer-link"
					>{appVersionLabel}</a
				>
			{:else}
				{appVersionLabel}
			{/if}
			<span class="mx-1 text-muted-foreground/35">/</span>
			Data updated: {DATA_LAST_UPDATED_DISPLAY}
		</p>
	</div>
</footer>

<style>
	.width {
		width: min(100%, 700px);
	}

	.footer-link {
		color: inherit;
		text-decoration: none;
		text-underline-offset: 3px;
		transition:
			color 120ms ease,
			text-decoration-color 120ms ease;
	}

	.footer-link:hover {
		color: hsl(var(--foreground));
		text-decoration: underline;
	}
</style>
