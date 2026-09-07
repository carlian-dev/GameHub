<script lang="ts">
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let cashiers = $state(data.cashiers);
	let username = $state('');
	let password = $state('');
	let displayName = $state('');
	let err = $state('');
	let msg = $state('');

	async function create() {
		err = '';
		msg = '';
		const res = await fetch('/api/admin/cashiers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, displayName })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? j.error?.code ?? 'Failed';
			return;
		}
		msg = 'Created';
		location.reload();
	}

	async function setStatus(id: string, status: string) {
		const res = await fetch(`/api/admin/cashiers/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		location.reload();
	}

	async function resetPw(id: string) {
		const pw = prompt('New password (min 6):');
		if (!pw) return;
		const res = await fetch(`/api/admin/cashiers/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password: pw })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		msg = 'Password reset';
	}
</script>

<div class="page-head">
	<p class="kicker">Administration</p>
	<h1>Cashiers</h1>
	<p class="sub">Create, disable, and reset passwords. Schedules are soft — outside hours still logs in but is recorded.</p>
</div>

{#if err}<div class="alert alert-error">{err}</div>{/if}
{#if msg}<div class="alert alert-ok">{msg}</div>{/if}

<div class="panel">
	<form onsubmit={(e)=>{e.preventDefault(); create();}} class="form-grid">
		<input class="input" bind:value={username} placeholder="username (e.g. cashier3)" required />
		<input class="input" bind:value={displayName} placeholder="Display name" required />
		<input class="input" type="password" bind:value={password} placeholder="password" required />
		<button type="submit" class="btn btn-primary">Create cashier</button>
	</form>
</div>

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Username</th><th>Display</th><th>Status</th><th>Actions</th></tr></thead>
			<tbody>
				{#each cashiers as c}
					<tr>
						<td class="mono">{c.username}</td>
						<td>{c.displayName}</td>
						<td><span class="badge" data-status={c.status}>{c.status}</span></td>
						<td class="actions">
							{#if c.status === 'ACTIVE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(c._id, 'DISABLED')}>Disable</button>{:else}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(c._id, 'ACTIVE')}>Enable</button>{/if}
							<button class="btn btn-ghost btn-sm" onclick={()=>resetPw(c._id)}>Reset password</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-head { margin-bottom: 20px; }
	.kicker { margin: 0 0 6px; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
	h1 { margin: 0; font-size: 1.7rem; letter-spacing: -0.03em; line-height: 1; font-weight: 700; }
	.sub { margin: 8px 0 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; max-width: 60ch; }
	.alert { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; margin: 12px 0; }
	.alert-error { background: var(--danger-soft); border: 1px solid rgba(215,0,21,0.18); color: var(--danger); }
	.alert-ok { background: var(--success-soft); border: 1px solid rgba(29,129,39,0.18); color: var(--success); }
	:global([data-theme='dark']) .alert-ok { color: #30d158; }
	.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-top: 16px; }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; }
	@media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } }
	.input {
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
	.table th { text-align: left; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; padding: 8px 10px; border-bottom: 1px solid var(--border); }
	.table td { padding: 10px; border-bottom: 1px solid var(--border); }
	.mono { font-weight: 600; letter-spacing: -0.01em; }
	.badge { font-size: 0.68rem; font-weight: 750; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 7px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); }
	.badge[data-status='ACTIVE'] { background: var(--success-soft); color: var(--success); border-color: rgba(29,129,39,0.18); }
	:global([data-theme='dark']) .badge[data-status='ACTIVE'] { color: #30d158; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; }
	.btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: transform 100ms ease-out, background 160ms ease; }
	.btn:active { transform: scale(0.97); }
	.btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-ghost:hover { background: var(--surface-2); }
	.btn-sm { padding: 6px 10px; font-size: 0.78rem; }
</style>
