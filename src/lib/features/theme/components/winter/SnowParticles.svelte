<script lang="ts">
	import { onMount } from 'svelte';
	import { isWinter } from '../../utils';

	let canvas: HTMLCanvasElement;
	let particles: Particle[] = [];
	const particleCount = 100; // Adjust the number of particles for density
	const maxSize = 3; // Maximum size of snow particles
	const minSize = 1; // Minimum size of snow particles
	const speed = 1; // Speed of falling snow

	// Define the Particle type
	interface Particle {
		x: number;
		y: number;
		size: number;
		speedY: number;
		speedX: number;
	}

	// Particle properties
	function createParticle(canvasWidth: number, canvasHeight: number): Particle {
		return {
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			size: Math.random() * (maxSize - minSize) + minSize,
			speedY: Math.random() * speed + 0.5,
			speedX: Math.random() * 0.5 - 0.25
		};
	}

	// Initialize particles
	function initParticles(canvasWidth: number, canvasHeight: number): void {
		particles = Array.from({ length: particleCount }, () =>
			createParticle(canvasWidth, canvasHeight)
		);
	}

	// Update particle positions
	function updateParticles(canvasWidth: number, canvasHeight: number): void {
		particles.forEach((particle) => {
			particle.y += particle.speedY;
			particle.x += particle.speedX;

			// Reset particle to top if it falls out of bounds
			if (particle.y > canvasHeight) {
				particle.y = 0;
				particle.x = Math.random() * canvasWidth;
			}
			if (particle.x > canvasWidth || particle.x < 0) {
				particle.x = Math.random() * canvasWidth;
			}
		});
	}

	// Draw particles on canvas
	function drawParticles(ctx: CanvasRenderingContext2D): void {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';

		particles.forEach((particle) => {
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	// Main animation loop
	function animate(): void {
		const ctx = canvas.getContext('2d');
		if (ctx) {
			const { width, height } = canvas;
			updateParticles(width, height);
			drawParticles(ctx);
			requestAnimationFrame(animate);
		}
	}

	// Initialize and start animation on mount
	onMount(() => {
		if (!isWinter()) return;

		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		initParticles(width, height);
		animate();
	});
</script>

{#if isWinter()}
	<canvas bind:this={canvas}></canvas>
{/if}

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: -1;
	}
</style>
