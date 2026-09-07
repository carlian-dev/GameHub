<script lang="ts">
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let tables = $state(data.tables);
	let newName = $state('');
	let newDesc = $state('');
	let msg = $state('');
	let err = $state('');

	async function create() {
		msg = '';
		err = '';
		const res = await fetch('/api/admin/tables', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newName, description: newDesc, status: 'AVAILABLE' })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		tables = [...tables, { _id: j.data.table._id, name: j.data.table.name, description: j.data.table.description, status: j.data.table.status, createdAt: '', updatedAt: '' }];
		newName = '';
		newDesc = '';
		msg = 'Created';
		location.reload();
	}

	async function setStatus(id: string, status: string) {
		err = '';
		msg = '';
		const res = await fetch(`/api/admin/tables/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? j.error?.code ?? 'Failed';
			return;
		}
		msg = `Updated to ${status}`;
		location.reload();
	}

	async function del(id: string) {
		if (!confirm('Delete table?')) return;
		const res = await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' });
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		location.reload();
	}
</script>

<div class="page-head">
	<p class="kicker">Administration</p>
	<h1>Tables</h1>
	<p class="sub">Create tables and manage maintenance. Operational <code>AVAILABLE</code> ↔ <code>OCCUPIED</code> is cashier via Board.</p>
</div>

{#if err}<div class="alert alert-error">{err}</div>{/if}
{#if msg}<div class="alert alert-ok">{msg}</div>{/if}

<div class="panel">
	<form onsubmit={(e)=>{e.preventDefault(); create();}} class="form">
		<input class="input" bind:value={newName} placeholder="Table name (e.g. Table 9)" required />
		<input class="input" bind:value={newDesc} placeholder="Description" />
		<button type="submit" class="btn btn-primary">Create table</button>
	</form>
</div>

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
			<tbody>
				{#each tables as t}
					<tr>
						<td class="mono">{t.name}</td>
						<td class="muted">{t.description || '—'}</td>
						<td><span class="badge" data-status={t.status}>{t.status}</span></td>
						<td class="actions">
							{#if t.status === 'AVAILABLE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(t._id, 'MAINTENANCE')}>Maintenance</button>{:else if t.status === 'MAINTENANCE' || t.status === 'OUT_OF_SERVICE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(t._id, 'AVAILABLE')}>Available</button>{/if}
							{#if t.status !== 'OUT_OF_SERVICE' && t.status !== 'MAINTENANCE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(t._id, 'OUT_OF_SERVICE')}>Out of service</button>{:else if t.status === 'OUT_OF_SERVICE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(t._id, 'MAINTENANCE')}>Maintenance</button>{/if}
							<button class="btn btn-danger btn-sm" onclick={()=>del(t._id)}>Delete</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="foot-note">Seeded 8 tables. Deleting blocked if active session or reservation exists.</p>
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
	.form { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
	.input {
		flex: 1 1 200px;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-size: 0.92rem;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
	.table-wrap { overflow-x: auto; }
	.table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
	.table th {
		text-align: left;
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	.table td { padding: 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
	.mono { font-weight: 600; letter-spacing: -0.01em; }
	.muted { color: var(--text-muted); }
	.badge {
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 3px 7px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-muted);
		white-space: nowrap;
	}
	.badge[data-status='AVAILABLE'] { background: var(--success-soft); color: var(--success); border-color: rgba(29,129,39,0.18); }
	:global([data-theme='dark']) .badge[data-status='AVAILABLE'] { color: #30d158; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; }
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 12px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-weight: 600;
		font-size: 0.82rem;
		cursor: pointer;
		transition: transform 100ms ease-out, background 160ms ease;
	}
	.btn:active { transform: scale(0.97); }
	.btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-ghost { background: var(--surface); }
	.btn-ghost:hover { background: var(--surface-2); }
	.btn-danger { background: var(--danger-soft); color: var(--danger); border-color: rgba(215,0,21,0.18); }
	.btn-sm { padding: 6px 10px; font-size: 0.78rem; }
	.foot-note { margin: 12px 0 0; font-size: 0.8rem; color: var(--text-muted); }
	@media (prefers-reduced-motion: reduce) { .btn { transition: opacity 160ms ease !important; } }
</style>
