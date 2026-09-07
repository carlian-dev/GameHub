<script lang="ts">
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let pricings = $state(data.pricings);
	let rate = $state(120);
	let err = $state('');
	let msg = $state('');

	async function create() {
		err = '';
		msg = '';
		const res = await fetch('/api/admin/pricing', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ratePerHour: Number(rate) })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		msg = `New rate ₱${j.data.pricing.ratePerHour}/hr active`;
		location.reload();
	}
</script>

<div class="page-head">
	<p class="kicker">Administration</p>
	<h1>Pricing</h1>
	<p class="sub">Flat hourly rate. Only one active at a time; previous rate gets <code>effectiveTo</code>. Historical snapshots preserved.</p>
</div>

{#if err}<div class="alert alert-error">{err}</div>{/if}
{#if msg}<div class="alert alert-ok">{msg}</div>{/if}

<div class="panel">
	<form onsubmit={(e)=>{e.preventDefault(); create();}} class="form">
		<label class="field"><span>New rate / hour</span><input class="input" type="number" bind:value={rate} min="1" step="1" required /></label>
		<button type="submit" class="btn btn-primary">Create new rate</button>
	</form>
</div>

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Rate/hr</th><th>Active</th><th>From</th><th>To</th></tr></thead>
			<tbody>
				{#each pricings as p}
					<tr class:active={p.isActive}>
						<td class="mono">₱{p.ratePerHour}</td>
						<td>{p.isActive ? '● Active' : '—'}</td>
						<td class="mono-sm">{p.effectiveFrom}</td>
						<td class="mono-sm">{p.effectiveTo ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="foot-note">Current active is used for new reservations and sessions. Existing sessions keep snapshot.</p>
</div>

<style>
	.page-head { margin-bottom: 20px; }
	.kicker { margin: 0 0 6px; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
	h1 { margin: 0; font-size: 1.7rem; letter-spacing: -0.03em; line-height: 1; font-weight: 700; }
	.sub { margin: 8px 0 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; max-width: 60ch; }
	.sub code { background: var(--surface-2); border: 1px solid var(--border); padding: 1px 5px; border-radius: 6px; font-size: 0.78rem; font-family: ui-monospace, monospace; }
	.alert { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; margin: 12px 0; }
	.alert-error { background: var(--danger-soft); border: 1px solid rgba(215,0,21,0.18); color: var(--danger); }
	.alert-ok { background: var(--success-soft); border: 1px solid rgba(29,129,39,0.18); color: var(--success); }
	:global([data-theme='dark']) .alert-ok { color: #30d158; }
	.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-top: 16px; }
	.form { display: flex; gap: 10px; align-items: end; flex-wrap: wrap; }
	.field { display: grid; gap: 4px; }
	.field span { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
	.input {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-size: 0.92rem;
		min-width: 140px;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
	.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: transform 100ms ease-out; }
	.btn:active { transform: scale(0.97); }
	.btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.table-wrap { overflow-x: auto; margin-top: 4px; }
	.table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
	.table th { text-align: left; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; padding: 8px 10px; border-bottom: 1px solid var(--border); }
	.table td { padding: 10px; border-bottom: 1px solid var(--border); }
	.table tr.active { background: var(--accent-soft); }
	.mono { font-weight: 600; letter-spacing: -0.01em; }
	.mono-sm { font-family: ui-monospace, monospace; font-size: 0.82rem; color: var(--text-muted); }
	.foot-note { margin: 12px 0 0; font-size: 0.8rem; color: var(--text-muted); }
</style>
