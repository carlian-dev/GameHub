<script lang="ts">
	import { onMount } from 'svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	let pricing: any = $state(null);
	let err = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/pricing/current');
			const j = await res.json();
			if (res.ok) pricing = j.data.pricing;
			else err = j.error?.message ?? 'No pricing';
		} catch (e) {
			err = (e as Error).message;
		}
	});
</script>

<svelte:head>
	<title>Rates — GameHub</title>
</svelte:head>

<AppNav
	links={[
		{ label: 'Tables', href: '/tables' },
		{ label: 'Rates', href: '/rates', current: true },
		{ label: 'Reserve', href: '/reserve' }
	]}
/>

<section class="hero-mini">
	<div class="hero-mini-inner">
		<p class="kicker">Simple &amp; fair</p>
		<h1>Rates</h1>
		<p class="sub">Flat hourly. Per-minute ceil. What you see is what you pay — snapshot preserved when you reserve.</p>
	</div>
</section>

<section class="panel">
	{#if err}<div class="alert alert-error">{err}</div>{/if}
	{#if pricing}
		<div class="price-card">
			<div class="price-main">
				<div class="price-amount">₱{pricing.ratePerHour}<span>/hour</span></div>
				<div class="price-meta">Effective {new Date(pricing.effectiveFrom).toLocaleDateString()} · Per-minute</div>
			</div>
			<div class="price-divider"></div>
			<ul class="price-points">
				<li>Pay only for minutes you play — <code>ceil((endedAt-startedAt)/60000)</code></li>
				<li>Orders added to same bill — one receipt</li>
				<li>Historical rate locked at reservation</li>
			</ul>
		</div>
		<div class="price-actions">
			<a href="/tables" class="btn btn-ghost">Check tables</a>
			<a href="/reserve" class="btn btn-primary">Reserve now</a>
		</div>
	{:else if !err}
		<p class="loading">Loading…</p>
	{/if}
</section>

<p class="foot"><small><a href="/">Home</a> · 09:00–02:00 · No per-second DB writes</small></p>

<style>
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font: 100%/1.5 system-ui, -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	.hero-mini {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 0 auto;
		padding: 32px 0 12px;
	}
	@media (min-width: 880px) {
		.hero-mini { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.kicker {
		margin: 0 0 6px;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.hero-mini h1 {
		margin: 0;
		font-size: clamp(1.7rem, 3.4vw, 2.3rem);
		letter-spacing: -0.03em;
		line-height: 1;
		font-weight: 700;
	}
	.sub {
		margin: 8px 0 0;
		color: var(--text-muted);
		max-width: 60ch;
		line-height: 1.6;
		font-size: 0.95rem;
	}
	.panel {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 16px auto 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 20px;
	}
	@media (min-width: 880px) {
		.panel { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.alert-error {
		background: var(--danger-soft);
		border: 1px solid rgba(215,0,21,0.18);
		color: var(--danger);
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		font-size: 0.88rem;
	}
	.loading { color: var(--text-muted); font-size: 0.92rem; }
	.price-card {
		display: grid;
		grid-template-columns: 1fr auto 1.2fr;
		gap: 20px;
		align-items: center;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 20px;
	}
	@media (max-width: 720px) {
		.price-card { grid-template-columns: 1fr; }
		.price-divider { display: none; }
	}
	.price-amount {
		font-size: clamp(2rem, 5vw, 2.6rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.price-amount span {
		font-size: 0.95rem;
		font-weight: 600;
		opacity: 0.6;
		letter-spacing: -0.01em;
		margin-left: 4px;
	}
	.price-meta {
		font-size: 0.82rem;
		color: var(--text-muted);
		margin-top: 6px;
	}
	.price-divider {
		width: 1px;
		align-self: stretch;
		background: var(--border);
	}
	.price-points {
		margin: 0;
		padding-left: 18px;
		color: var(--text-secondary);
		line-height: 1.6;
		font-size: 0.9rem;
	}
	.price-points code {
		background: var(--surface);
		border: 1px solid var(--border);
		padding: 1px 6px;
		border-radius: 6px;
		font-size: 0.78rem;
		font-family: ui-monospace, monospace;
	}
	.price-actions {
		display: flex;
		gap: 10px;
		margin-top: 16px;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
	.btn {
		display: inline-flex;
		padding: 10px 16px;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9rem;
		text-decoration: none;
		border: 1px solid transparent;
		transition: transform 100ms ease-out, background 160ms ease;
		letter-spacing: -0.01em;
	}
	.btn:active { transform: scale(0.97); }
	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-ghost {
		background: var(--surface);
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-ghost:hover { background: var(--surface-2); }
	.foot {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 16px auto 24px;
		color: var(--text-muted);
		font-size: 0.84rem;
	}
	@media (min-width: 880px) {
		.foot { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.foot a { color: var(--text); text-underline-offset: 3px; }
</style>
