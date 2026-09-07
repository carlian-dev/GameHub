<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	type Link = { label: string; href: string; current?: boolean };
	let {
		links = [] as Link[],
		variant = 'public' as 'public' | 'admin' | 'cashier',
		user = null as { displayName: string; role: string } | null,
		onLogout = undefined as (() => void) | undefined
	} = $props();
</script>

<nav class="app-nav" aria-label="Primary navigation">
	<div class="app-nav-inner">
		<a href={variant === 'admin' ? '/admin/dashboard' : variant === 'cashier' ? '/board' : '/'} class="brand" aria-label="GameHub home">
			<span class="brand-mark" aria-hidden="true"><span class="brand-mark-inner">8</span></span>
			<span class="brand-text">GameHub</span>
			{#if variant !== 'public'}
				<span class="brand-badge">{variant === 'admin' ? 'Admin' : 'Cashier'}</span>
			{/if}
		</a>

		<div class="nav-links" role="navigation">
			{#each links as l}
				<a href={l.href} class="nav-link" aria-current={l.current ? 'page' : undefined}>{l.label}</a>
			{/each}
		</div>

		<div class="nav-actions">
			{#if user}
				<span class="user-pill">
					<span class="user-dot" data-variant={variant} aria-hidden="true"></span>
					<span class="user-name">{user.displayName}</span>
					<span class="user-role">{user.role}</span>
				</span>
			{/if}
			<ThemeToggle />
			{#if onLogout}
				<button class="btn btn-ghost btn-sm" onclick={onLogout}>Log out</button>
			{/if}
		</div>
	</div>
	<div class="nav-hairline" aria-hidden="true"></div>
</nav>

<style>
	.app-nav {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--nav-bg);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-bottom: 1px solid transparent;
	}
	.app-nav-inner {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 16px;
		height: 52px;
	}
	@media (min-width: 880px) {
		.app-nav-inner {
			width: min(var(--content-width), calc(100% - 48px));
		}
	}
	.nav-hairline {
		height: 1px;
		background: var(--nav-border);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text);
		flex-shrink: 0;
	}
	.brand-mark {
		width: 28px;
		height: 28px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: var(--text);
		color: var(--bg);
		flex: none;
	}
	.brand-mark-inner {
		font-size: 12px;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1;
		width: 18px;
		height: 18px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		border: 1.5px solid currentColor;
		background: transparent;
	}
	/* In dark, swap so mark stays high contrast */
	:global([data-theme='dark']) .brand-mark {
		background: #fff;
		color: #000;
	}
	.brand-text {
		font-weight: 650;
		letter-spacing: -0.022em;
		font-size: 0.98rem;
	}
	.brand-badge {
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 999px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-muted);
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: 8px;
	}
	@media (max-width: 880px) {
		.nav-links { display: none; }
	}
	.nav-link {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.88rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		padding: 6px 12px;
		border-radius: 999px;
		transition:
			background 160ms ease,
			color 160ms ease;
	}
	.nav-link:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.nav-link[aria-current='page'] {
		color: var(--text);
		background: var(--surface-2);
		font-weight: 600;
	}
	/* Current as inverted pill on minimal – stronger */
	.nav-link[aria-current='page']:where(:hover) {
		background: var(--surface-hover);
	}
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-left: auto;
	}
	.user-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.82rem;
		white-space: nowrap;
	}
	@media (max-width: 640px) {
		.user-pill { display: none; }
	}
	.user-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.user-dot[data-variant='admin'] {
		background: #86868b;
		box-shadow: none;
	}
	.user-name { font-weight: 600; letter-spacing: -0.01em; }
	.user-role {
		opacity: 0.6;
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-weight: 600;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 100ms ease-out,
			background 160ms ease,
			border-color 160ms ease;
		will-change: transform;
	}
	.btn:active { transform: scale(0.97); }
	.btn-sm {
		padding: 7px 12px;
		font-size: 0.82rem;
	}
	.btn-ghost {
		background: transparent;
		border-color: var(--border);
	}
	.btn-ghost:hover {
		background: var(--surface-2);
		border-color: var(--border-strong);
	}
	@media (prefers-reduced-motion: reduce) {
		.btn { transition: opacity 160ms ease !important; transform: none !important; }
	}
</style>
