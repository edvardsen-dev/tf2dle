<script lang="ts">
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import { Dices, Flame } from '@lucide/svelte';
	import ShareResult from '#lib/components/games/ShareResult.svelte';
	import type { ShareMode } from '#lib/share.ts';

	interface Props {
		img: { src: string; alt: string };
		imgSize?: string;
		challenge: string;
		value: string;
		tries: number;
		streak: number;
		correctGuesses: number;
		nextChallenge?: string | null;
		shareMode: ShareMode;
		shareGuesses: unknown[];
		open: boolean;
	}

	let {
		img,
		imgSize = '100%',
		challenge,
		value,
		tries,
		streak,
		correctGuesses,
		nextChallenge = null,
		shareMode,
		shareGuesses,
		open = $bindable()
	}: Props = $props();
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
