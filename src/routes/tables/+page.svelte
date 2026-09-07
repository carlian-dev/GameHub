<script lang="ts">
	import AppNav from '$lib/components/AppNav.svelte';

	let date = $state(new Date().toISOString().slice(0, 10));
	let startTime = $state('10:00');
	let duration = $state(60);
	let tables = $state<any[]>([]);
	let loading = $state(false);
	let err = $state('');
	let hasChecked = $state(false);

	let activeBtn: string | null = $state(null);

	async function check() {
		loading = true;
		err = '';
		hasChecked = true;
		try {
			const res = await fetch(`/api/tables/availability?date=${date}&startTime=${startTime}&duration=${duration}`);
			const j = await res.json();
			if (!res.ok) {
				err = j.error?.message ?? 'Failed to check availability';
				tables = [];
				return;
			}
			tables = j.data.tables;
		} catch (e) {
			err = (e as Error).message;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		check();
	});
</script>

<svelte:head>
	<title>Tables — GameHub</title>
</svelte:head>

<AppNav
	links={[
		{ label: 'Tables', href: '/tables', current: true },
		{ label: 'Rates', href: '/rates' },
		{ label: 'Reserve', href: '/reserve' }
	]}
/>

<section class="hero-mini">
	<div class="hero-mini-inner">
		<p class="kicker">Find your table</p>
		<h1>Available tables</h1>
		<p class="sub">Eight tournament tables. Check a time — we respect the 10-minute buffer and 7-day window.</p>
	</div>
</section>

<section class="panel">
	<form class="controls" onsubmit={(e) => { e.preventDefault(); check(); }}>
		<label class="field">
			<span>Date</span>
			<input type="date" bind:value={date} required />
		</label>
		<label class="field">
			<span>Start</span>
			<input type="time" bind:value={startTime} required />
		</label>
		<label class="field">
			<span>Duration</span>
			<select bind:value={duration}>
				<option value={30}>30 min</option>
				<option value={60}>60 min</option>
				<option value={90}>90 min</option>
				<option value={120}>2 hours</option>
				<option value={180}>3 hours</option>
			</select>
		</label>
		<button
			type="submit"
			class="btn btn-primary"
			disabled={loading}
			data-active={activeBtn === 'check'}
			onpointerdown={() => (activeBtn = 'check')}
			onpointerup={() => (activeBtn = null)}
			onpointerleave={() => (activeBtn = null)}
		>
			{loading ? 'Checking…' : 'Check'}
		</button>
		<a href="/reserve" class="btn btn-ghost" data-active={activeBtn === 'reserve'} onpointerdown={() => (activeBtn = 'reserve')} onpointerup={() => (activeBtn = null)} onpointerleave={() => (activeBtn = null)}>Reserve →</a>
	</form>
	{#if err}<div class="alert alert-error">{err}</div>{/if}
	{#if hasChecked && !err && tables.length}
		<p class="result-meta">{tables.filter((t) => t.isAvailable).length} of {tables.length} available · {date} at {startTime} · {duration} min</p>
	{/if}
</section>

<div class="grid">
	{#each tables as t}
		<article class="tcard" data-available={t.isAvailable}>
			<header class="tcard-head">
				<h3>{t.name}</h3>
				<span class="badge" data-state={t.isAvailable === false ? 'busy' : t.isAvailable ? 'free' : 'neutral'}>
					{#if t.isAvailable === true}Available{:else if t.isAvailable === false}{t.reason ?? 'Unavailable'}{:else}{t.status}{/if}
				</span>
			</header>
			<p class="tcard-id">#{t._id.slice(-4)} · {t.status}</p>
			<div class="tcard-foot">
				{#if t.isAvailable}
					<a href="/reserve" class="tcard-action">Reserve this →</a>
				{:else if t.isAvailable === false}
					<span class="tcard-hint">{t.reason === 'OCCUPIED' ? 'In play' : t.reason === 'RESERVED' ? 'Reserved' : 'Unavailable'}</span>
				{/if}
			</div>
		</article>
	{/each}
</div>

{#if !loading && hasChecked && tables.length === 0 && !err}
	<div class="empty">No tables found for this slot. Try a different time.</div>
{/if}

<p class="foot">
	<small>Buffer 10 min · Max 7 days · Hours 09:00–02:00 · <a href="/rates">Rates</a> · <a href="/">Home</a></small>
</p>

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
	.hero-mini .sub {
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
		padding: 16px;
	}
	@media (min-width: 880px) {
		.panel { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.controls {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: end;
	}
	.field {
		display: grid;
		gap: 4px;
		font-size: 0.74rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 600;
	}
	.field input,
	.field select {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-size: 0.93rem;
		min-width: 140px;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.field input:focus,
	.field select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9rem;
		text-decoration: none;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			transform 100ms ease-out,
			background 160ms ease,
			border-color 160ms ease;
		will-change: transform;
	}
	.btn:active,
	.btn[data-active='true'] { transform: scale(0.97); }
	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
	.btn-ghost {
		background: var(--surface);
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-ghost:hover { background: var(--surface-2); }
	.alert {
		margin-top: 12px;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		font-size: 0.88rem;
	}
	.alert-error {
		background: var(--danger-soft);
		border: 1px solid rgba(215, 0, 21, 0.18);
		color: var(--danger);
	}
	.result-meta {
		margin: 12px 0 0;
		font-size: 0.84rem;
		color: var(--text-muted);
	}
	.grid {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 16px auto 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 14px;
	}
	@media (min-width: 880px) {
		.grid { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.tcard {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 16px;
		transition:
			transform 160ms ease,
			border-color 160ms ease;
	}
	.tcard:hover {
		transform: translateY(-1px);
		border-color: var(--border-strong);
	}
	@media (prefers-reduced-motion: reduce) {
		.tcard { transition: none; }
		.tcard:hover { transform: none; }
	}
	.tcard-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.tcard-head h3 {
		margin: 0;
		letter-spacing: -0.015em;
		font-size: 1rem;
		font-weight: 650;
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 4px 8px;
		border-radius: 999px;
		border: 1px solid;
		white-space: nowrap;
	}
	.badge[data-state='free'] {
		background: var(--success-soft);
		border-color: rgba(29,129,39,0.18);
		color: var(--success);
	}
	:global([data-theme='dark']) .badge[data-state='free'] { color: #30d158; border-color: rgba(48,209,88,0.24); }
	.badge[data-state='busy'] {
		background: var(--danger-soft);
		border-color: rgba(215,0,21,0.18);
		color: var(--danger);
	}
	.badge[data-state='neutral'] {
		background: var(--surface-2);
		border-color: var(--border);
		color: var(--text-muted);
	}
	.tcard-id {
		margin: 6px 0 0;
		font-size: 0.82rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.tcard-foot {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		font-size: 0.84rem;
	}
	.tcard-action {
		margin-left: auto;
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.86rem;
	}
	.tcard-action:hover { color: var(--accent); }
	.tcard-hint {
		margin-left: auto;
		color: var(--text-muted);
		font-weight: 500;
		font-size: 0.84rem;
	}
	.empty {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 16px auto 0;
		padding: 16px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.92rem;
	}
	@media (min-width: 880px) {
		.empty { width: min(var(--content-width), calc(100% - 48px)); }
	}
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
	.foot a:hover { color: var(--accent); }
	@media (prefers-reduced-motion: reduce) {
		.btn { transition: opacity 160ms ease !important; transform: none !important; }
	}
</style>
