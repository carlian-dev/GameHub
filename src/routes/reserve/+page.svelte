<script lang="ts">
	import AppNav from '$lib/components/AppNav.svelte';
	let tables: any[] = $state([]);
	let pricing: any = $state(null);
	let tableId = $state('');
	let date = $state(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
	let startTime = $state('10:00');
	let durationMinutes = $state(60);
	let customerName = $state('');
	let customerContact = $state('');
	let customerEmail = $state('');
	let err = $state('');
	let ok = $state('');
	let createdId = $state('');
	let activeBtn: string | null = $state(null);

	async function loadMeta() {
		try {
			const [tRes, pRes] = await Promise.all([fetch('/api/tables/availability'), fetch('/api/pricing/current')]);
			const tj = await tRes.json();
			const pj = await pRes.json();
			if (tRes.ok) tables = tj.data.tables;
			if (pRes.ok) pricing = pj.data.pricing;
		} catch {}
	}

	$effect(() => {
		loadMeta();
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		err = '';
		ok = '';
		createdId = '';
		const res = await fetch('/api/reservations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tableId, customerName, customerContact, customerEmail, date, startTime, durationMinutes: Number(durationMinutes) })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? j.error?.code ?? 'Failed';
			if (j.error?.details) err += ' ' + JSON.stringify(j.error.details);
			return;
		}
		ok = `Reserved — ${j.data.reservation._id.slice(-6)}`;
		createdId = j.data.reservation._id;
	}

	function viewCreated() {
		if (createdId) window.location.href = `/reservations/${createdId}?contact=${encodeURIComponent(customerContact)}`;
	}
</script>

<svelte:head>
	<title>Reserve — GameHub</title>
</svelte:head>

<AppNav
	links={[
		{ label: 'Tables', href: '/tables' },
		{ label: 'Rates', href: '/rates' },
		{ label: 'Reserve', href: '/reserve', current: true }
	]}
/>

<header class="hero-mini">
	<div class="hero-mini-inner">
		<p class="kicker">Guest checkout · 30 seconds</p>
		<h1>Reserve a table</h1>
		<p class="sub">No account needed. Name + <code>09…</code> and you’re set — pricing locked at booking.</p>
	</div>
</header>

<section class="panel">
	{#if pricing}
		<div class="rate-pill">
			<span class="pill-dot"></span>
			<span>Current rate <strong>₱{pricing.ratePerHour}/hour</strong> · per-minute</span>
		</div>
	{/if}

	{#if err}<div class="alert alert-error">{err}</div>{/if}
	{#if ok}<div class="alert alert-ok">{ok} <button class="link-btn" onclick={viewCreated}>View confirmation →</button></div>{/if}

	<form onsubmit={submit} class="form">
		<div class="form-grid">
			<label class="field">
				<span>Table</span>
				<select bind:value={tableId} required>
					<option value="" disabled>Select table</option>
					{#each tables as t}
						<option value={t._id}>{t.name} — {t.status}</option>
					{/each}
				</select>
				<small><a href="/tables">Check availability</a> first</small>
			</label>

			<label class="field">
				<span>Date</span>
				<input type="date" bind:value={date} required />
			</label>

			<label class="field">
				<span>Start time</span>
				<input type="time" bind:value={startTime} required />
			</label>

			<label class="field">
				<span>Duration</span>
				<select bind:value={durationMinutes}>
					<option value={30}>30 min</option>
					<option value={60}>60 min</option>
					<option value={90}>90 min</option>
					<option value={120}>2 hours</option>
					<option value={180}>3 hours</option>
					<option value={240}>4 hours</option>
				</select>
			</label>

			<label class="field">
				<span>Name</span>
				<input bind:value={customerName} placeholder="Juan Dela Cruz" required />
			</label>

			<label class="field">
				<span>Contact — 09…</span>
				<input bind:value={customerContact} placeholder="09xxxxxxxxx" required pattern={"(\\+639|09)[0-9]{9}"} />
				<small>We’ll use this to find your booking</small>
			</label>

			<label class="field field-full">
				<span>Email <em>(optional)</em></span>
				<input type="email" bind:value={customerEmail} placeholder="email@example.com" />
			</label>
		</div>

		<div class="form-foot">
			<button
				type="submit"
				class="btn btn-primary"
				data-active={activeBtn === 'reserve'}
				onpointerdown={() => (activeBtn = 'reserve')}
				onpointerup={() => (activeBtn = null)}
				onpointerleave={() => (activeBtn = null)}
			>
				Confirm reservation
			</button>
			<span class="foot-hint">Buffer 10 min · 7-day window · 09:00–02:00</span>
		</div>
	</form>
</section>

<p class="foot"><small><a href="/">Home</a> · Need to change? Use your confirmation link to cancel before start time.</small></p>

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
	.sub code {
		background: var(--surface-2);
		border: 1px solid var(--border);
		padding: 1px 5px;
		border-radius: 6px;
		font-size: 0.82em;
		font-family: ui-monospace, monospace;
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
	.rate-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		padding: 8px 12px;
		border-radius: 999px;
		font-size: 0.86rem;
		margin-bottom: 16px;
		color: var(--text-secondary);
	}
	.pill-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--success);
		box-shadow: 0 0 0 3px var(--success-soft);
	}
	.alert {
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		font-size: 0.88rem;
		margin-bottom: 12px;
	}
	.alert-error {
		background: var(--danger-soft);
		border: 1px solid rgba(215,0,21,0.18);
		color: var(--danger);
	}
	.alert-ok {
		background: var(--success-soft);
		border: 1px solid rgba(29,129,39,0.18);
		color: var(--success);
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	:global([data-theme='dark']) .alert-ok { color: #30d158; }
	.link-btn {
		background: var(--text);
		color: var(--bg);
		border: 0;
		padding: 6px 10px;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.84rem;
	}
	:global([data-theme='dark']) .link-btn { background: #fff; color: #000; }
	.form { display: grid; gap: 16px; }
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}
	@media (max-width: 720px) {
		.form-grid { grid-template-columns: 1fr; }
	}
	.field { display: grid; gap: 6px; }
	.field span {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.field em {
		font-style: normal;
		opacity: 0.6;
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}
	.field input,
	.field select {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 11px 12px;
		font-size: 0.93rem;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.field input:focus,
	.field select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.field small {
		font-size: 0.76rem;
		color: var(--text-muted);
	}
	.field small a { color: var(--text); text-underline-offset: 3px; }
	.field-full { grid-column: 1 / -1; }
	.form-foot {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		padding-top: 4px;
	}
	.btn {
		display: inline-flex;
		padding: 12px 18px;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.92rem;
		border: 1px solid transparent;
		cursor: pointer;
		transition: transform 100ms ease-out, background 160ms ease;
		text-decoration: none;
		letter-spacing: -0.01em;
	}
	.btn:active,
	.btn[data-active='true'] { transform: scale(0.97); }
	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.foot {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 14px auto 24px;
		color: var(--text-muted);
		font-size: 0.84rem;
	}
	@media (min-width: 880px) {
		.foot { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.foot a { color: var(--text); text-underline-offset: 3px; }
	.foot-hint { font-size: 0.82rem; color: var(--text-muted); }
	@media (prefers-reduced-motion: reduce) {
		.btn { transition: opacity 160ms ease !important; transform: none !important; }
	}
</style>
