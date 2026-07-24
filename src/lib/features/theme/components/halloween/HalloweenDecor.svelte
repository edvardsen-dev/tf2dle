<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import dayjs from '$lib/configs/dayjsConfig';
	import { disableExtraVisuals } from '../../composables/useDisableTheme';
	import { isHalloween } from '../../utils';

	const SWARM_STORAGE_KEY = 'halloween_bat_swarm_seen_year';
	const SWARM_DURATION_MS = 5200;

	let showBatSwarm = false;
	let hideBatSwarmTimeout: ReturnType<typeof setTimeout> | undefined;

	const swarmBats = [
		{ top: 10, delay: 0, duration: 3.4, scale: 0.95, rise: 18, rotation: -5, size: 5.4 },
		{ top: 18, delay: 0.1, duration: 3.1, scale: 0.7, rise: 8, rotation: 6, size: 4.2 },
		{ top: 27, delay: 0.22, duration: 3.55, scale: 1.12, rise: -12, rotation: -8, size: 6.1 },
		{ top: 35, delay: 0.34, duration: 3.2, scale: 0.82, rise: 14, rotation: 9, size: 4.7 },
		{ top: 46, delay: 0.46, duration: 3.7, scale: 1.25, rise: -6, rotation: -3, size: 6.8 },
		{ top: 58, delay: 0.58, duration: 3.45, scale: 0.74, rise: 10, rotation: 7, size: 4.3 },
		{ top: 67, delay: 0.72, duration: 3.6, scale: 1.04, rise: -16, rotation: -9, size: 5.8 },
		{ top: 75, delay: 0.86, duration: 3.15, scale: 0.63, rise: 7, rotation: 5, size: 3.8 },
		{ top: 22, delay: 1, duration: 3.1, scale: 0.88, rise: 20, rotation: -7, size: 5 },
		{ top: 51, delay: 1.14, duration: 3.45, scale: 1.1, rise: -10, rotation: 4, size: 6 },
		{ top: 82, delay: 1.28, duration: 3.25, scale: 0.8, rise: -18, rotation: -6, size: 4.6 },
		{ top: 14, delay: 1.42, duration: 3.65, scale: 1.2, rise: 12, rotation: 8, size: 6.4 }
	];

	onMount(() => {
		if (!isHalloween() || get(disableExtraVisuals)) return;

		const year = dayjs().year().toString();

		try {
			if (localStorage.getItem(SWARM_STORAGE_KEY) === year) return;

			localStorage.setItem(SWARM_STORAGE_KEY, year);
		} catch {
			return;
		}

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		showBatSwarm = true;
		hideBatSwarmTimeout = setTimeout(() => {
			showBatSwarm = false;
		}, SWARM_DURATION_MS);

		return () => {
			if (hideBatSwarmTimeout) clearTimeout(hideBatSwarmTimeout);
		};
	});
</script>

{#if !$disableExtraVisuals && isHalloween()}
	<div class="halloween-decor" aria-hidden="true">
		<div class="moon"></div>

		<svg class="web web-left" viewBox="0 0 120 120">
			<path d="M0 0 L120 0 L0 120 Z" />
			<path d="M0 0 L82 0 M0 0 L58 24 M0 0 L37 47 M0 0 L16 75 M0 0 L0 102" />
			<path d="M24 0 C23 21 14 35 0 45 M50 0 C45 34 28 56 0 75 M78 0 C68 51 42 84 0 103" />
		</svg>

		<svg class="web web-right" viewBox="0 0 120 120">
			<path d="M120 0 L0 0 L120 120 Z" />
			<path d="M120 0 L38 0 M120 0 L62 24 M120 0 L83 47 M120 0 L104 75 M120 0 L120 102" />
			<path d="M96 0 C97 21 106 35 120 45 M70 0 C75 34 92 56 120 75 M42 0 C52 51 78 84 120 103" />
		</svg>

		<svg class="bat bat-1" viewBox="0 0 120 48">
			<path
				d="M4 25 C18 4 31 5 39 22 C43 13 50 9 60 9 C70 9 77 13 81 22 C89 5 102 4 116 25 C99 20 91 24 84 36 C74 28 66 39 60 46 C54 39 46 28 36 36 C29 24 21 20 4 25 Z"
			/>
		</svg>
		<svg class="bat bat-2" viewBox="0 0 120 48">
			<path
				d="M4 25 C18 4 31 5 39 22 C43 13 50 9 60 9 C70 9 77 13 81 22 C89 5 102 4 116 25 C99 20 91 24 84 36 C74 28 66 39 60 46 C54 39 46 28 36 36 C29 24 21 20 4 25 Z"
			/>
		</svg>
		<svg class="bat bat-3" viewBox="0 0 120 48">
			<path
				d="M4 25 C18 4 31 5 39 22 C43 13 50 9 60 9 C70 9 77 13 81 22 C89 5 102 4 116 25 C99 20 91 24 84 36 C74 28 66 39 60 46 C54 39 46 28 36 36 C29 24 21 20 4 25 Z"
			/>
		</svg>

		<div class="pumpkin pumpkin-left">
			<div class="stem"></div>
			<div class="eye eye-left"></div>
			<div class="eye eye-right"></div>
			<div class="mouth"></div>
		</div>
		<div class="pumpkin pumpkin-right">
			<div class="stem"></div>
			<div class="eye eye-left"></div>
			<div class="eye eye-right"></div>
			<div class="mouth"></div>
		</div>
	</div>

	{#if showBatSwarm}
		<div class="bat-swarm" aria-hidden="true">
			{#each swarmBats as bat}
				<div
					class="swarm-bat"
					style={`--top: ${bat.top}%; --delay: ${bat.delay}s; --duration: ${bat.duration}s; --scale: ${bat.scale}; --rise: ${bat.rise}vh; --rotation: ${bat.rotation}deg; --size: ${bat.size}rem;`}
				>
					<svg class="swarm-bat-shape" viewBox="0 0 120 48">
						<path
							d="M4 25 C18 4 31 5 39 22 C43 13 50 9 60 9 C70 9 77 13 81 22 C89 5 102 4 116 25 C99 20 91 24 84 36 C74 28 66 39 60 46 C54 39 46 28 36 36 C29 24 21 20 4 25 Z"
						/>
					</svg>
				</div>
			{/each}
		</div>
	{/if}
{/if}

<style>
	.halloween-decor {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}

	.bat-swarm {
		position: fixed;
		inset: 0;
		z-index: 50;
		overflow: hidden;
		pointer-events: none;
	}

	.swarm-bat {
		position: absolute;
		left: -9rem;
		top: var(--top);
		width: var(--size);
		opacity: 0;
		animation: swarm-flight var(--duration) cubic-bezier(0.32, 0.02, 0.42, 1) var(--delay) forwards;
		filter: drop-shadow(0 0 0.45rem rgba(249, 115, 22, 0.45));
	}

	.swarm-bat-shape {
		width: 100%;
		fill: rgba(5, 0, 8, 0.95);
		animation: swarm-flap 0.28s ease-in-out var(--delay) infinite alternate;
	}

	.moon {
		position: absolute;
		right: clamp(1.25rem, 8vw, 6rem);
		top: clamp(5rem, 10vw, 8rem);
		height: clamp(4.5rem, 12vw, 8rem);
		width: clamp(4.5rem, 12vw, 8rem);
		border-radius: 999px;
		background: radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 70%);
		box-shadow: 0 0 3rem rgba(245, 158, 11, 0.35);
		opacity: 0.58;
	}

	.web {
		position: absolute;
		top: 0;
		width: clamp(6rem, 18vw, 13rem);
		color: rgba(250, 250, 250, 0.2);
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
	}

	.web-left {
		left: 0;
	}

	.web-right {
		right: 0;
	}

	.bat {
		position: absolute;
		color: rgba(8, 3, 12, 0.86);
		fill: currentColor;
		filter: drop-shadow(0 0 0.35rem rgba(147, 51, 234, 0.35));
	}

	.bat-1 {
		right: clamp(7rem, 22vw, 19rem);
		top: clamp(4rem, 9vw, 7rem);
		width: clamp(4rem, 10vw, 7rem);
		animation: drift 9s ease-in-out infinite;
	}

	.bat-2 {
		left: clamp(2rem, 11vw, 9rem);
		top: clamp(8rem, 15vw, 13rem);
		width: clamp(3rem, 8vw, 5.5rem);
		animation: drift 11s ease-in-out -3s infinite;
	}

	.bat-3 {
		right: clamp(1.5rem, 12vw, 10rem);
		top: clamp(14rem, 24vw, 20rem);
		width: clamp(2.5rem, 7vw, 4rem);
		animation: drift 8s ease-in-out -5s infinite;
	}

	.pumpkin {
		position: absolute;
		bottom: -1.5rem;
		height: 4.4rem;
		width: 5.3rem;
		border-radius: 45% 45% 38% 38%;
		background:
			radial-gradient(ellipse at 32% 50%, rgba(194, 65, 12, 0.7) 0 24%, transparent 25%),
			radial-gradient(ellipse at 68% 50%, rgba(194, 65, 12, 0.7) 0 24%, transparent 25%),
			linear-gradient(90deg, #c2410c, #f97316 45%, #c2410c);
		box-shadow: 0 0 1.5rem rgba(249, 115, 22, 0.3);
		opacity: 0.78;
	}

	.pumpkin-left {
		left: clamp(0.5rem, 4vw, 3rem);
		transform: rotate(-7deg);
	}

	.pumpkin-right {
		right: clamp(0.5rem, 4vw, 3rem);
		transform: rotate(7deg) scale(0.82);
	}

	.stem {
		position: absolute;
		left: 2.35rem;
		top: -0.5rem;
		height: 0.95rem;
		width: 0.5rem;
		border-radius: 0.2rem;
		background: #713f12;
		transform: rotate(10deg);
	}

	.eye {
		position: absolute;
		top: 1.35rem;
		height: 0;
		width: 0;
		border-left: 0.38rem solid transparent;
		border-right: 0.38rem solid transparent;
		border-bottom: 0.65rem solid #1c0a22;
	}

	.eye-left {
		left: 1.35rem;
	}

	.eye-right {
		right: 1.35rem;
	}

	.mouth {
		position: absolute;
		left: 1.7rem;
		top: 2.55rem;
		height: 0.55rem;
		width: 1.9rem;
		border-radius: 0 0 999px 999px;
		background: #1c0a22;
	}

	@keyframes drift {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(-2deg);
		}
		50% {
			transform: translate3d(0.7rem, -0.45rem, 0) rotate(3deg);
		}
	}

	@keyframes swarm-flight {
		0% {
			opacity: 0;
			transform: translate3d(-8vw, 0, 0) scale(var(--scale)) rotate(var(--rotation));
		}
		8%,
		86% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate3d(126vw, var(--rise), 0) scale(var(--scale)) rotate(var(--rotation));
		}
	}

	@keyframes swarm-flap {
		from {
			transform: scaleY(0.75);
		}
		to {
			transform: scaleY(1.08);
		}
	}

	@media (max-width: 640px) {
		.web,
		.bat-2,
		.pumpkin-right {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.swarm-bat,
		.swarm-bat-shape,
		.bat {
			animation: none;
		}
	}
</style>
