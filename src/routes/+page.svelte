<script lang="ts">
	import { onMount } from 'svelte';
	import AppNav from '$lib/components/AppNav.svelte';

	let pricing: any = $state(null);
	onMount(async () => {
		try {
			const res = await fetch('/api/pricing/current');
			const j = await res.json();
			if (res.ok) pricing = j.data.pricing;
		} catch {}
	});


	let activeBtn: string | null = $state(null);
</script>

<svelte:head>
	<title>GameHub — Billiard Hall</title>
	<meta name="description" content="Premium billiard hall in Bukidnon — reserve tables, track time, order drinks. Open 09:00–02:00." />
</svelte:head>

<AppNav
	links={[
		{ label: 'Tables', href: '/tables' },
		{ label: 'Rates', href: '/rates' },
		{ label: 'Reserve', href: '/reserve' }
	]}
/>

<!-- Hero — minimal, airy, type-driven -->
<section class="hero" aria-label="GameHub hero">
	<div class="hero-inner">
		<p class="eyebrow">Bukidnon • Est. 2024 • Open 09:00–02:00</p>
		<h1 class="display">
			<span class="display-line">Where</span>
			<span class="display-line display-accent">precision</span>
			<span class="display-line">meets play.</span>
		</h1>
		<p class="sub">
			Eight tournament-grade tables. Reserve in seconds, play without watching the clock — we track time for you.
		</p>

		<div class="hero-actions">
			<a
				href="/reserve"
				class="btn btn-primary"
				data-active={activeBtn === 'reserve'}
				onpointerdown={() => (activeBtn = 'reserve')}
				onpointerup={() => (activeBtn = null)}
				onpointerleave={() => (activeBtn = null)}
			>
				Reserve a table
				<span class="btn-arrow" aria-hidden="true">→</span>
			</a>
			<a
				href="/tables"
				class="btn btn-secondary"
				data-active={activeBtn === 'tables'}
				onpointerdown={() => (activeBtn = 'tables')}
				onpointerup={() => (activeBtn = null)}
				onpointerleave={() => (activeBtn = null)}
			>
				Check availability
			</a>
		</div>

		<div class="hero-meta" aria-label="At a glance">
			<div class="meta-pill">
				<span class="meta-num">8</span>
				<span class="meta-label">Tables · 9ft</span>
			</div>
			<div class="meta-pill">
				<span class="meta-num">₱{pricing ? pricing.ratePerHour : '120'}</span>
				<span class="meta-label">/ hour · per minute</span>
			</div>
			<div class="meta-pill">
				<span class="meta-num">02:00</span>
				<span class="meta-label">Close · Daily</span>
			</div>
		</div>
	</div>
</section>

<!-- Experience — 3 minimal cards -->
<section id="experience" class="section">
	<header class="section-head">
		<p class="kicker">The experience</p>
		<h2>Built for the love of the game.</h2>
		<p class="section-sub">Not an arcade. A quiet room, fast felt, and everything handled so you can focus on the next shot.</p>
	</header>

	<div class="cards">
		<article class="card">
			<div class="card-icon" aria-hidden="true">◯</div>
			<h3>Tournament felt</h3>
			<p>Championship cloth, leveled weekly. Rails that answer, pockets that reward a clean stroke.</p>
			<a href="/tables" class="card-link">View tables <span aria-hidden="true">→</span></a>
		</article>
		<article class="card card-featured">
			<div class="card-icon" aria-hidden="true">◷</div>
			<h3>Time, handled</h3>
			<p>Start, extend, and settle without watching the clock. Per-minute billing, snapshot pricing, clear receipts.</p>
			<a href="/reserve" class="card-link">Reserve now <span aria-hidden="true">→</span></a>
		</article>
		<article class="card">
			<div class="card-icon" aria-hidden="true">◎</div>
			<h3>Stay &amp; sip</h3>
			<p>Ice-cold drinks and bites, served to your table. Order once, pay together.</p>
			<a href="/rates" class="card-link">See rates <span aria-hidden="true">→</span></a>
		</article>
	</div>
</section>

<!-- How it works — minimal steps -->
<section class="section steps">
	<header class="section-head">
		<p class="kicker">How it works</p>
		<h2>Three steps to play.</h2>
	</header>
	<ol class="steps-grid">
		<li class="step">
			<span class="step-no">01</span>
			<h3>Check &amp; reserve</h3>
			<p>Pick a table, date, and start time. Name + <code>09…</code> — done in under a minute.</p>
			<div class="step-foot">
				<span class="step-hint">10 min buffer · 7-day window</span>
				<a href="/reserve" class="step-link">Reserve →</a>
			</div>
		</li>
		<li class="step">
			<span class="step-no">02</span>
			<h3>Arrive &amp; play</h3>
			<p>Cashier checks you in and starts the timer. Time is derived from <code>startedAt</code> — no per-second writes.</p>
			<div class="step-foot">
				<span class="step-hint">Extend anytime</span>
				<span class="step-soon">Queue if full</span>
			</div>
		</li>
		<li class="step">
			<span class="step-no">03</span>
			<h3>Order &amp; settle</h3>
			<p>Add drinks to the same session. One bill: table time + orders. Cash or GCash.</p>
			<div class="step-foot">
				<span class="step-hint">Pricing locked at booking</span>
				<a href="/rates" class="step-link">Rates →</a>
			</div>
		</li>
	</ol>
</section>

<!-- Feature band — minimal, no wood/felt skeuomorphism -->
<section class="band">
	<div class="band-inner">
		<div class="band-copy">
			<p class="kicker">The room</p>
			<h2>Quiet light.<br />Fast felt.</h2>
			<p>We kept it minimal so the game comes first. One accent, generous whitespace, and type that speaks clearly.</p>
			<div class="band-actions">
				<a href="/tables" class="btn btn-primary">Explore tables</a>
				<span class="band-note">8 tables · 09:00–02:00 · Bukidnon</span>
			</div>
		</div>
		<div class="band-visual" aria-hidden="true">
			<div class="band-card">
				<div class="band-felt"></div>
				<div class="band-dots">
					<span class="dot"></span><span class="dot dot-dark"></span><span class="dot dot-gold"></span>
				</div>
				<span class="band-label">Table 5 · 9ft · Tournament</span>
			</div>
		</div>
	</div>
</section>

<!-- Info — grouping, wayfinding -->
<section class="section info">
	<div class="info-grid">
		<div class="info-card">
			<h3>Hours</h3>
			<p><strong>09:00 – 02:00</strong> daily</p>
			<p class="muted">Last reservation at 01:00. Walk-ins welcome — queue is FIFO, reservations hold the next 30 min.</p>
		</div>
		<div class="info-card">
			<h3>Find us</h3>
			<p>Bukidnon, Philippines</p>
			<p class="muted">Near city center · Parking at rear · Ask for GameHub at the desk.</p>
		</div>
		<div class="info-card">
			<h3>Contact</h3>
			<p>Reserve at <a href="/reserve">/reserve</a></p>
			<p class="muted">No account needed · Name + 09… is enough.</p>
		</div>
	</div>
</section>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<span class="footer-mark" aria-hidden="true">8</span>
			<span>GameHub</span>
			<span class="footer-copy">© 2026 · Bukidnon</span>
		</div>
		<nav class="footer-nav" aria-label="Footer">
			<a href="/tables">Tables</a>
			<a href="/rates">Rates</a>
			<a href="/reserve">Reserve</a>
		</nav>
	</div>
</footer>

<style>
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
	}
	/* Container */
	.hero-inner,
	.section,
	.band-inner,
	.info-grid,
	.footer-inner {
		width: min(var(--content-width), calc(100% - 32px));
		margin-inline: auto;
	}
	@media (min-width: 880px) {
		.hero-inner,
		.section,
		.band-inner,
		.info-grid,
		.footer-inner {
			width: min(var(--content-width), calc(100% - 48px));
		}
	}

	/* Hero — generous whitespace, no image, no felt */
	.hero {
		padding: 56px 0 32px;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}
	@media (min-width: 880px) {
		.hero { padding: 72px 0 40px; }
	}
	.eyebrow {
		margin: 0 0 16px;
		font-size: 0.76rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 600;
	}
	.display {
		margin: 0;
		font-size: clamp(2.6rem, 6.2vw, 4.8rem);
		line-height: 0.9;
		letter-spacing: -0.045em;
		font-weight: 700;
		max-width: 12ch;
	}
	.display-line { display: block; }
	.display-accent {
		color: var(--accent);
	}
	.sub {
		margin: 18px 0 0;
		max-width: 56ch;
		font-size: clamp(1rem, 1.6vw, 1.08rem);
		line-height: 1.6;
		color: var(--text-muted);
		letter-spacing: -0.01em;
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 28px;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 18px;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.93rem;
		letter-spacing: -0.01em;
		line-height: 1;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			transform 100ms ease-out,
			background 160ms ease,
			border-color 160ms ease,
			color 160ms ease;
		will-change: transform;
	}
	.btn:active,
	.btn[data-active='true'] { transform: scale(0.97); }
	.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}
	.btn-primary:hover { opacity: 0.92; }
	:global([data-theme='dark']) .btn-primary {
		background: #fff;
		color: #000;
		border-color: #fff;
	}
	.btn-secondary {
		background: var(--surface);
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-secondary:hover {
		background: var(--surface-2);
		border-color: var(--border-strong);
	}
	.btn-arrow { opacity: 0.7; }

	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 28px;
	}
	.meta-pill {
		display: inline-flex;
		align-items: baseline;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 999px;
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.84rem;
	}
	.meta-num {
		font-weight: 700;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}
	.meta-label {
		color: var(--text-muted);
		font-size: 0.82rem;
	}

	/* Sections */
	.section { padding: 48px 0; }
	@media (min-width: 960px) { .section { padding: 56px 0; } }
	.kicker {
		margin: 0 0 8px;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.section-head { max-width: 640px; margin-bottom: 28px; }
	.section-head h2 {
		margin: 0;
		font-size: clamp(1.6rem, 3.2vw, 2.2rem);
		line-height: 1.05;
		letter-spacing: -0.032em;
		font-weight: 700;
		color: var(--text);
	}
	.section-sub {
		margin: 10px 0 0;
		color: var(--text-muted);
		line-height: 1.6;
		font-size: 0.97rem;
		max-width: 56ch;
	}

	/* Cards — flat, minimal */
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
		align-items: start;
	}
	@media (max-width: 880px) { .cards { grid-template-columns: 1fr; } }
	.card {
		padding: 20px 18px;
		border-radius: var(--radius-lg);
		background: var(--surface);
		border: 1px solid var(--border);
		transition:
			border-color 160ms ease,
			transform 160ms ease;
	}
	.card:hover {
		border-color: var(--border-strong);
		transform: translateY(-1px);
	}
	.card-featured {
		background: var(--surface);
		border-color: var(--border-strong);
	}
	.card-icon {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		display: grid;
		place-items: center;
		background: var(--surface-2);
		border: 1px solid var(--border);
		margin-bottom: 14px;
		font-size: 0.9rem;
		color: var(--text-muted);
	}
	.card-featured .card-icon {
		background: var(--accent-soft);
		border-color: var(--accent-soft-strong);
		color: var(--accent);
	}
	.card h3 {
		margin: 0 0 6px;
		font-size: 1rem;
		letter-spacing: -0.015em;
		line-height: 1.2;
		font-weight: 650;
	}
	.card p {
		margin: 0;
		color: var(--text-muted);
		line-height: 1.6;
		font-size: 0.92rem;
	}
	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 14px;
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.88rem;
	}
	.card-link:hover { color: var(--accent); }
	@media (prefers-reduced-motion: reduce) {
		.card { transition: none; }
		.card:hover { transform: none; }
	}

	/* Steps — hairline minimal */
	.steps { padding-top: 8px; }
	.steps-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}
	@media (max-width: 880px) { .steps-grid { grid-template-columns: 1fr; } }
	.step {
		padding: 18px 16px;
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.step-no {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 999px;
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.06em;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-muted);
		margin-bottom: 12px;
		font-variant-numeric: tabular-nums;
	}
	.step h3 {
		margin: 0 0 6px;
		font-size: 0.98rem;
		letter-spacing: -0.015em;
		font-weight: 650;
	}
	.step p {
		margin: 0;
		color: var(--text-muted);
		line-height: 1.6;
		font-size: 0.9rem;
	}
	.step p code {
		font-size: 0.78rem;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: 6px;
		border: 1px solid var(--border);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	.step-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.step-hint {
		font-size: 0.76rem;
		color: var(--text-faint);
	}
	.step-link {
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.84rem;
		white-space: nowrap;
	}
	.step-link:hover { color: var(--accent); }
	.step-soon {
		font-size: 0.74rem;
		color: var(--text-faint);
		border: 1px solid var(--border);
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--surface-2);
	}

	/* Band — replaces rail wood */
	.band {
		margin-top: 12px;
		background: var(--surface-2);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.band-inner {
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: 28px;
		align-items: center;
		padding: 36px 0;
	}
	@media (max-width: 880px) { .band-inner { grid-template-columns: 1fr; } }
	.band-copy h2 {
		margin: 0;
		font-size: clamp(1.5rem, 3vw, 2rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
		font-weight: 700;
	}
	.band-copy p {
		margin: 12px 0 0;
		color: var(--text-muted);
		line-height: 1.6;
		max-width: 52ch;
		font-size: 0.95rem;
	}
	.band-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-top: 18px;
	}
	.band-note {
		font-size: 0.82rem;
		color: var(--text-muted);
	}
	.band-visual {
		position: relative;
		aspect-ratio: 1.45;
		border-radius: var(--radius-lg);
		overflow: clip;
		background: var(--surface);
		border: 1px solid var(--border);
		padding: 16px;
		display: grid;
		place-items: center;
	}
	.band-card {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-md);
		background: var(--bg);
		border: 1px solid var(--border);
		position: relative;
		overflow: clip;
		display: grid;
		place-items: center;
	}
	.band-felt {
		position: absolute;
		inset: 12px;
		border-radius: 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	.band-dots {
		position: relative;
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.dot {
		width: 18px;
		height: 18px;
		border-radius: 999px;
		background: #fff;
		border: 1px solid var(--border-strong);
		box-shadow: var(--shadow-sm);
	}
	.dot-dark { background: #111; border-color: #fff; }
	:global([data-theme='dark']) .dot-dark { background: #fff; border-color: #000; }
	.dot-gold { background: #f5f5f7; border-color: var(--border-strong); }
	.band-label {
		position: absolute;
		left: 20px;
		bottom: 16px;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		background: var(--surface);
		border: 1px solid var(--border);
		padding: 4px 8px;
		border-radius: 999px;
	}

	/* Info */
	.info { padding-top: 24px; }
	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}
	@media (max-width: 880px) { .info-grid { grid-template-columns: 1fr; } }
	.info-card {
		padding: 18px 16px;
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.info-card h3 {
		margin: 0 0 6px;
		font-size: 0.82rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.info-card p {
		margin: 0;
		line-height: 1.6;
		font-size: 0.93rem;
	}
	.info-card .muted {
		color: var(--text-muted);
		font-size: 0.88rem;
	}
	.info-card a { color: var(--text); text-underline-offset: 3px; }
	.info-card a:hover { color: var(--accent); }

	/* Footer — hairline, minimal */
	.footer {
		margin-top: 16px;
		border-top: 1px solid var(--border);
		padding: 18px 0 28px;
		background: var(--surface);
	}
	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}
	.footer-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.88rem;
		color: var(--text-muted);
	}
	.footer-mark {
		width: 22px;
		height: 22px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: var(--text);
		color: var(--bg);
		font-size: 10px;
		font-weight: 800;
		border: 1px solid var(--text);
	}
	:global([data-theme='dark']) .footer-mark {
		background: #fff;
		color: #000;
		border-color: #fff;
	}
	.footer-copy { opacity: 0.7; }
	.footer-nav {
		display: flex;
		gap: 14px;
	}
	.footer-nav a {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.88rem;
	}
	.footer-nav a:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }

	@media (prefers-reduced-motion: reduce) {
		.btn { transition: opacity 200ms ease !important; transform: none !important; }
	}
</style>
