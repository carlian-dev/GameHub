<script lang="ts">
	import { onMount } from 'svelte';
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let cashiers = $state(data.cashiers);
	let username = $state('');
	let password = $state('');
	let displayName = $state('');
	let err = $state('');
	let msg = $state('');
	let pendingLinkId: string | null = $state(null);
	let linking = $state(false);

	onMount(() => {
		const clientId = (data as any)?.googleClientId;
		if (!clientId) return;
		const init = () => {
			const g = (window as any).google;
			if (!g?.accounts?.id) return;
			g.accounts.id.initialize({
				client_id: clientId,
				callback: async (resp: any) => {
					const credential = resp?.credential;
					const targetId = pendingLinkId;
					pendingLinkId = null;
					if (!credential || !targetId) return;
					err = ''; msg = '';
					linking = true;
					try {
						const res = await fetch(`/api/admin/users/${targetId}/link-google`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ credential })
						});
						const j = await res.json();
						if (!res.ok) {
							err = j.error?.message ?? j.error?.code ?? 'Link failed';
							if (j.error?.details) err += ' ' + JSON.stringify(j.error.details);
							return;
						}
						msg = 'Google linked';
						location.reload();
					} catch (e) {
						err = (e as Error).message;
					} finally {
						linking = false;
					}
				},
				auto_select: false,
				cancel_on_tap_outside: true
			});
		};
		const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
		if (existing) {
			if ((window as any).google?.accounts?.id) init();
			else existing.addEventListener('load', init);
			return;
		}
		const s = document.createElement('script');
		s.src = 'https://accounts.google.com/gsi/client';
		s.async = true;
		s.defer = true;
		s.onload = init;
		document.head.appendChild(s);
	});

	function triggerGoogleLink(id: string) {
		pendingLinkId = id;
		err = ''; msg = '';
		const g = (window as any).google;
		if (!g?.accounts?.id) {
			err = 'Google Sign-In not ready. Please wait and try again.';
			return;
		}
		g.accounts.id.prompt((notification: any) => {
			if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
				err = 'Google prompt not displayed. Ensure popups are allowed and try again. Alternatively, have the staff sign in on this device first.';
			}
		});
	}

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

	function linkGoogle(id: string) {
		triggerGoogleLink(id);
	}

	async function unlinkGoogle(id: string) {
		if (!confirm('Unlink Google account? Staff will no longer be able to use Google Sign-In.')) return;
		err = ''; msg = '';
		const res = await fetch(`/api/admin/users/${id}/link-google`, { method: 'DELETE' });
		const j = await res.json();
		if (!res.ok) {
			err = j.error?.message ?? 'Unlink failed';
			return;
		}
		msg = 'Google unlinked';
		location.reload();
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
			<thead><tr><th>Username</th><th>Display</th><th>Status</th><th>Google</th><th>Actions</th></tr></thead>
			<tbody>
				{#each cashiers as c}
					<tr>
						<td class="mono">{c.username}</td>
						<td>{c.displayName}</td>
						<td><span class="badge" data-status={c.status}>{c.status}</span></td>
						<td>
							{#if (c as any).googleId}
								<span class="badge" data-available="true">Linked</span>
								<small class="muted" style="margin-left:6px">{(c as any).email ?? (c as any).googleId.slice(0,8)+'…'}</small>
							{:else}
								<span class="badge">Not linked</span>
							{/if}
						</td>
						<td class="actions">
							{#if c.status === 'ACTIVE'}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(c._id, 'DISABLED')}>Disable</button>{:else}<button class="btn btn-ghost btn-sm" onclick={()=>setStatus(c._id, 'ACTIVE')}>Enable</button>{/if}
							<button class="btn btn-ghost btn-sm" onclick={()=>resetPw(c._id)}>Reset password</button>
							{#if (c as any).googleId}
								<button class="btn btn-ghost btn-sm" onclick={()=>unlinkGoogle(c._id)}>Unlink Google</button>
							{:else}
								<button class="btn btn-ghost btn-sm" onclick={()=>linkGoogle(c._id)}>Link Google</button>
							{/if}
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
	.badge[data-available='true'] { background: var(--success-soft); color: var(--success); border-color: rgba(29,129,39,0.18); }
	:global([data-theme='dark']) .badge[data-available='true'] { color: #30d158; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; }
	.btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: transform 100ms ease-out, background 160ms ease; }
	.btn:active { transform: scale(0.97); }
	.btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-ghost:hover { background: var(--surface-2); }
	.btn-sm { padding: 6px 10px; font-size: 0.78rem; }
</style>
