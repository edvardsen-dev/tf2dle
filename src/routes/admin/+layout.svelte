<script lang="ts">
	import { page } from '$app/stores';
	import { Activity, ExternalLink, LogOut } from 'lucide-svelte';

	$: isLoginPage = $page.route.id === '/admin/login';
</script>

<div class="min-h-screen bg-background text-foreground">
	<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
		<div
			class="absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-primary/15 blur-3xl"
		></div>
		<div
			class="absolute bottom-[-16rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-sky-500/10 blur-3xl"
		></div>
		<div
			class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]"
		></div>
	</div>

	<header class="border-b border-border/70 bg-background/85 backdrop-blur">
		<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
			<div class="flex gap-4 items-end">
				<a href="/admin" class="flex items-center gap-3">
					<span
						class="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary"
					>
						<Activity size={20} />
					</span>
					<span>
						<span class="block text-sm font-semibold uppercase tracking-[0.25em] text-primary"
							>TF2DLE</span
						>
						<span class="block text-lg font-bold leading-tight">Admin console</span>
					</span>
				</a>

				{#if !isLoginPage}
					<nav
						class="order-last flex w-full items-center gap-1 rounded-lg text-sm lg:order-none lg:w-auto"
						aria-label="Admin navigation"
					>
						{#each [{ href: '/admin', label: 'Metrics' }, { href: '/admin/notification', label: 'Notification' }] as item}
							<a
								class="flex-1 rounded-md px-4 py-2 text-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-primary/10 aria-[current=page]:font-semibold aria-[current=page]:text-primary"
								href={item.href}
								aria-current={$page.route.id === item.href ? 'page' : undefined}
							>
								{item.label}
							</a>
						{/each}
					</nav>
				{/if}
			</div>

			<div class="flex items-center gap-3 text-sm text-muted-foreground">
				<a
					class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 hover:bg-accent hover:text-accent-foreground"
					href="/"
				>
					Open app
					<ExternalLink size={14} />
				</a>
				{#if !isLoginPage}
					<form method="POST" action="/admin?/logout">
						<button
							class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
							type="submit"
							aria-label="Logout"
						>
							<LogOut size={14} />
							<span class="hidden sm:inline">Logout</span>
						</button>
					</form>
				{/if}
			</div>
		</div>
	</header>

	<div class="py-8">
		<slot />
	</div>
</div>
