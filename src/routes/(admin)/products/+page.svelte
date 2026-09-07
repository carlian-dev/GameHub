<script lang="ts">
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let products = $state(data.products);
	let name = $state('');
	let category = $state('DRINK');
	let unitPrice = $state(30);
	let err = $state('');
	let msg = $state('');

	async function create() {
		err = '';
		msg = '';
		const res = await fetch('/api/admin/products', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, category, unitPrice: Number(unitPrice), isAvailable: true })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		location.reload();
	}

	async function toggle(id: string, cur: boolean) {
		const res = await fetch(`/api/admin/products/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isAvailable: !cur })
		});
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Failed';
			return;
		}
		location.reload();
	}

	async function del(id: string) {
		if (!confirm('Delete product?')) return;
		const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
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
	<h1>Products</h1>
	<p class="sub">Drinks and snacks catalog. Snapshot price preserved in orders.</p>
</div>

{#if err}<div class="alert alert-error">{err}</div>{/if}
{#if msg}<div class="alert alert-ok">{msg}</div>{/if}

<div class="panel">
	<form onsubmit={(e)=>{e.preventDefault(); create();}} class="form">
		<input class="input" bind:value={name} placeholder="Name" required />
		<select class="input" bind:value={category}><option>DRINK</option><option>SNACK</option><option>OTHER</option></select>
		<input class="input" type="number" bind:value={unitPrice} min="1" />
		<button type="submit" class="btn btn-primary">Create</button>
	</form>
</div>

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
			<tbody>
				{#each products as p}
					<tr>
						<td class="mono">{p.name}</td>
						<td class="muted">{p.category}</td>
						<td class="mono">₱{p.unitPrice}</td>
						<td><span class="badge" data-available={p.isAvailable}>{p.isAvailable ? 'Available' : 'Hidden'}</span></td>
						<td class="actions">
							<button class="btn btn-ghost btn-sm" onclick={()=>toggle(p._id, p.isAvailable)}>Toggle</button>
							<button class="btn btn-danger btn-sm" onclick={()=>del(p._id)}>Delete</button>
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
	.sub { margin: 8px 0 0; color: var(--text-muted); font-size: 0.92rem; }
	.alert { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; margin: 12px 0; }
	.alert-error { background: var(--danger-soft); border: 1px solid rgba(215,0,21,0.18); color: var(--danger); }
	.alert-ok { background: var(--success-soft); border: 1px solid rgba(29,129,39,0.18); color: var(--success); }
	:global([data-theme='dark']) .alert-ok { color: #30d158; }
	.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-top: 16px; }
	.form { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
	.input {
		flex: 1 1 160px;
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
	.muted { color: var(--text-muted); }
	.badge { font-size: 0.68rem; font-weight: 750; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 7px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-2); }
	.badge[data-available='true'] { background: var(--success-soft); color: var(--success); border-color: rgba(29,129,39,0.18); }
	:global([data-theme='dark']) .badge[data-available='true'] { color: #30d158; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; }
	.btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: transform 100ms ease-out; }
	.btn:active { transform: scale(0.97); }
	.btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-ghost:hover { background: var(--surface-2); }
	.btn-danger { background: var(--danger-soft); color: var(--danger); border-color: rgba(215,0,21,0.18); }
	.btn-sm { padding: 6px 10px; font-size: 0.78rem; }
</style>
