import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			preprocess: vitePreprocess(),
			compilerOptions: { runes: true }
		}),
		svelteTesting()
	],
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		maxWorkers: 2
	}
});
