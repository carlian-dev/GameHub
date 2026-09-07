<script lang="ts">
	import AppNav from '$lib/components/AppNav.svelte';
	let id = $state('');
	let contact = $state('');
	let reservation: any = $state(null);
	let err = $state('');
	let msg = $state('');
	let activeBtn: string | null = $state(null);

	$effect(() => {
		const url = new URL(window.location.href);
		const parts = url.pathname.split('/');
		id = parts[2] ?? '';
		contact = url.searchParams.get('contact') ?? '';
		if (id && contact) load();
	});

	async function load() {
		err = '';
		msg = '';
		const res = await fetch(`/api/reservations/${id}?contact=${encodeURIComponent(contact)}`);
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			reservation = null;
			return;
		}
		reservation = j.data.reservation;
	}

	async function cancel() {
		if (!confirm('Cancel this reservation? This cannot be undone.')) return;
		err = '';
		msg = '';
		const res = await fetch(`/api/reservations/${id}/cancel`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ contact })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Cancel failed';
			return;
		}
		msg = 'Cancelled — slot freed.';
		reservation = j.data.reservation;
	}
</script>

<svelte:head>
	<title>Reservation — GameHub</title>
</svelte:head>

<AppNav
	links={[
		{ label: 'Tables', href: '/tables' },
		{ label: 'Rates', href: '/rates' },
		{ label: 'Reserve', href: '/reserve' }
	]}
/>

<header class="hero-mini">
	<div class="hero-mini-inner">
		<p class="kicker">Confirmation</p>
		<h1>Reservation</h1>
		<p class="sub">Bring your contact number to check in. Grace 15 min · Buffer 10 min.</p>
	</div>
</header>

<section class="panel">
	<form onsubmit={(e) => { e.preventDefault(); load(); }} class="lookup">
		<label class="field">
			<span>Reservation ID</span>
			<input bind:value={id} placeholder="e.g. 64a..." required />
		</label>
		<label class="field">
			<span>Contact</span>
			<input bind:value={contact} placeholder="09xxxxxxxxx" required />
		</label>
		<button
			type="submit"
			class="btn btn-secondary"
			data-active={activeBtn === 'view'}
			onpointerdown={() => (activeBtn = 'view')}
			onpointerup={() => (activeBtn = null)}
			onpointerleave={() => (activeBtn = null)}
		>
			View
		</button>
	</form>

	{#if err}<div class="alert alert-error">{err}</div>{/if}
	{#if msg}<div class="alert alert-ok">{msg}</div>{/if}

	{#if reservation}
		<article class="ticket">
			<header class="ticket-head">
				<span class="ticket-id">#{reservation._id.slice(-6)}</span>
				<span class="badge" data-status={reservation.status}>{reservation.status}</span>
			</header>

			<div class="ticket-body">
				<div class="ticket-row">
					<span>Table</span>
					<strong>{reservation.tableName ?? reservation.tableId.slice(-4)}</strong>
				</div>
				<div class="ticket-row">
					<span>Date</span>
					<strong>{reservation.date}</strong>
				</div>
				<div class="ticket-row">
					<span>Time</span>
					<strong>{new Date(reservation.startTime).toLocaleString()} — {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {reservation.durationMinutes} min</strong>
				</div>
				<div class="ticket-divider"></div>
				<div class="ticket-row">
					<span>Guest</span>
					<strong>{reservation.customerName}</strong>
				</div>
				<div class="ticket-row">
					<span>Contact</span>
					<strong>{reservation.customerContact}</strong>
				</div>
				<div class="ticket-row">
					<span>Rate</span>
					<strong>₱{reservation.pricingSnapshot?.ratePerHour}/hr</strong>
				</div>
			</div>

			<footer class="ticket-foot">
				{#if reservation.status === 'CONFIRMED'}
					<button
						class="btn btn-danger"
						onclick={cancel}
						data-active={activeBtn === 'cancel'}
						onpointerdown={() => (activeBtn = 'cancel')}
						onpointerup={() => (activeBtn = null)}
						onpointerleave={() => (activeBtn = null)}
					>
						Cancel reservation
					</button>
					<span class="foot-hint">Free cancellation before start time</span>
				{:else}
					<span class="foot-hint">Status: {reservation.status} — ask at desk for help.</span>
				{/if}
			</footer>
		</article>
	{/if}
</section>

<p class="foot"><small><a href="/reserve">New reservation</a> · <a href="/">Home</a></small></p>

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
	.lookup {
		display: grid;
		grid-template-columns: 1fr 180px auto;
		gap: 10px;
		align-items: end;
	}
	@media (max-width: 720px) {
		.lookup { grid-template-columns: 1fr; }
	}
	.field { display: grid; gap: 6px; }
	.field span {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.field input {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 11px 12px;
		font-size: 0.93rem;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.field input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.btn {
		display: inline-flex;
		padding: 11px 16px;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9rem;
		border: 1px solid transparent;
		cursor: pointer;
		transition: transform 100ms ease-out, background 160ms ease;
		text-decoration: none;
		letter-spacing: -0.01em;
	}
	.btn:active,
	.btn[data-active='true'] { transform: scale(0.97); }
	.btn-secondary {
		background: var(--surface);
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-secondary:hover { background: var(--surface-2); }
	.btn-danger {
		background: var(--danger);
		color: #fff;
		border-color: var(--danger);
		padding: 10px 16px;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.btn-danger:hover { opacity: 0.9; }
	.alert {
		margin-top: 12px;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		font-size: 0.88rem;
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
	}
	:global([data-theme='dark']) .alert-ok { color: #30d158; }
	.ticket {
		margin-top: 16px;
		border-radius: var(--radius-md);
		overflow: clip;
		border: 1px solid var(--border);
		background: var(--surface-2);
		max-width: 560px;
	}
	.ticket-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.ticket-id {
		font-weight: 700;
		letter-spacing: -0.015em;
		font-variant-numeric: tabular-nums;
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 4px 8px;
		border-radius: 999px;
		border: 1px solid;
	}
	.badge[data-status='CONFIRMED'] {
		background: var(--success-soft);
		border-color: rgba(29,129,39,0.18);
		color: var(--success);
	}
	:global([data-theme='dark']) .badge[data-status='CONFIRMED'] { color: #30d158; }
	.badge[data-status='CANCELLED'] {
		background: var(--danger-soft);
		border-color: rgba(215,0,21,0.18);
		color: var(--danger);
	}
	.badge[data-status='CHECKED_IN'] {
		background: var(--accent-soft);
		border-color: var(--accent-soft-strong);
		color: var(--accent);
	}
	.ticket-body {
		padding: 14px 16px;
		display: grid;
		gap: 8px;
		background: var(--surface);
	}
	.ticket-row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 0.92rem;
	}
	.ticket-row span { color: var(--text-muted); }
	.ticket-divider {
		height: 1px;
		background: var(--border);
		margin: 4px 0;
	}
	.ticket-foot {
		padding: 14px 16px;
		background: var(--surface-2);
		border-top: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.foot-hint { font-size: 0.84rem; color: var(--text-muted); }
	.foot {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 14px auto 24px;
		color: var(--text-muted);
		font-size: 0.84rem;
	}
	@media (min-width: 880px) { .foot { width: min(var(--content-width), calc(100% - 48px)); } }
	.foot a { color: var(--text); text-underline-offset: 3px; }
	.foot a:hover { color: var(--accent); }
	@media (prefers-reduced-motion: reduce) {
		.btn { transition: opacity 160ms ease !important; transform: none !important; }
	}
</style>
