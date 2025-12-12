<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/layouts/Footer.svelte';
	import Header from '$lib/components/layouts/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import Command from '$lib/components/command/Command.svelte';
	import SnowParticles from '$lib/features/theme/components/winter/SnowParticles.svelte';
	import XmasLights from '$lib/features/theme/components/x-mas/XmasLights.svelte';
	import Background from '$lib/features/theme/components/Background.svelte';
	import { DevBanner } from '$lib/components/ui/dev-banner';

	setMode('dark');
</script>

<svelte:head>
	<link rel="icon" href="/favicon/favicon.ico" />
	<meta content="width=device-width, initial-scale=1" name="viewport" />

	<title>TF2DLE</title>
	<meta name="description" content="A wordle like game for TF2" />
	<meta name="keywords" content="tf2, wordle, tf2dle, tf2 wordle, tf2 wordle game, tf2 wordle" />
	<meta name="author" content="Joakim Edvardsen" />
</svelte:head>

<ModeWatcher />
<Toaster />

<Command />

<XmasLights />
<SnowParticles />

<Background />

<DevBanner />

<div class="flex flex-col gap-10 px-2 m-auto pt-14 pb-10 min-h-screen">
	<Header />
	<div class="flex-grow">
		<slot />
	</div>
	<Footer />
</div>

<style scoped>
	.width {
		width: min(100%, 700px);
	}
</style>
