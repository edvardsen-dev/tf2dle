<script lang="ts">
	import dayjs from '$lib/configs/dayjsConfig';
	import { getGameModeResetTime } from '$lib/utils/reset';
	import { onDestroy } from 'svelte';

	let interval: number;
	let timeTilReset = initializeResetTime();

	$: hours = timeTilReset.hours() < 10 ? `0${timeTilReset.hours()}` : timeTilReset.hours();
	$: minutes = timeTilReset.minutes() < 10 ? `0${timeTilReset.minutes()}` : timeTilReset.minutes();
	$: seconds = timeTilReset.seconds() < 10 ? `0${timeTilReset.seconds()}` : timeTilReset.seconds();

	onDestroy(() => {
		clearInterval(interval);
	});

	function initializeResetTime() {
		if (interval) {
			clearInterval(interval);
		}

		const now = dayjs().local();
		const resetTime = getGameModeResetTime();

		const diff = resetTime.diff(now);

		interval = setInterval(() => {
			updateTimer();
		}, 1000) as unknown as number;

		return dayjs.duration(diff);
	}

	function updateTimer() {
		if (timeTilReset.asSeconds() <= 0) {
			timeTilReset = initializeResetTime();
		}
		timeTilReset = timeTilReset.subtract(1, 'second');
	}
</script>

<div class="text-center">
	<p class="grid">
		Games will reset in: <span class="text-3xl" data-testId="timer"
			>{hours}:{minutes}:{seconds}</span
		>
	</p>
</div>

<footer class="text-muted-foreground text-sm width m-auto">
	<p>
		Made by <a href="https://edvardsen.dev" target="_blank" class="underline">Joakim Edvardsen</a>
	</p>
	<p>
		Like the product? Support me <a
			href="https://www.buymeacoffee.com/joakimedvam"
			target="_blank"
			class="underline">here</a
		>
		| Found a bug? Report it to me
		<a href="https://www.reddit.com/user/jaakim" target="_blank" class="underline">here!</a>
		| Want to contribute? Check out the project
		<a href="https://github.com/edvardsen-dev/tf2dle" target="_blank" class="underline">here!</a>
	</p>
</footer>

<style scoped>
	.width {
		width: min(100%, 700px);
	}
</style>
