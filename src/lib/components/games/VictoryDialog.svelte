<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Dices, Flame } from 'lucide-svelte';
	import ShareResult from '$lib/components/games/ShareResult.svelte';
	import type { ShareMode } from '$lib/share';

	// Image of the correct guess
	export let img: { src: string; alt: string };
	export let imgSize: string = '100%';
	// Label of the correct guess (e.g. "Weapon", "Map", etc.)
	export let challenge: string;
	// Value of the correct guess (e.g. "Rocket Launcher", "Badlands", etc.)
	export let value: string;
	// Number of tries it took to guess the correct value
	export let tries: number;
	// The user's current streak
	export let streak: number;
	// How many have already guessed the current challenge
	export let correctGuesses: number;
	// A link to the next challenge
	export let nextChallenge: string | null = null;
	// Share metadata for the solved challenge
	export let shareMode: ShareMode;
	export let shareGuesses: unknown[];

	export let open: boolean;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Correct!</Dialog.Title>
			<Dialog.Description
				>You are gamer number {correctGuesses} to guess the correct {challenge.toLowerCase()}!</Dialog.Description
			>
		</Dialog.Header>
		<div class="grid" data-testId="dialog">
			<div class="text-center">
				<img
					src={img.src}
					alt={img.alt}
					class="rounded-sm mt-4 mb-2"
					style={`--width: ${imgSize}`}
				/>
				<h1 class="font-semibold text-lg">{value}</h1>
			</div>
			<div class="flex justify-around my-12">
				<div class="flex items-center gap-2">
					<Dices class="w-8 h-8" />
					<div class="leading-3">
						<p class="text-sm text-muted-foreground">Tries</p>
						<p>{tries}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Flame class="w-8 h-8" />
					<div class="leading-3">
						<p class="text-sm text-muted-foreground">Streak</p>
						<p>{streak}</p>
					</div>
				</div>
			</div>
			{#if nextChallenge}
				<Button href={nextChallenge} variant="secondary" class="mb-2">Next challenge</Button>
			{/if}
			<ShareResult mode={shareMode} guesses={shareGuesses} {streak} class="w-full" />
		</div>
	</Dialog.Content>
</Dialog.Root>

<style scoped>
	img {
		width: var(--width, 100%);
		margin-inline: auto;
	}
</style>
