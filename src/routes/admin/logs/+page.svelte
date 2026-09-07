<script lang="ts">
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let logs = $state(data.logs);
</script>

<div class="page-head">
	<p class="kicker">Administration</p>
	<h1>Activity logs</h1>
	<p class="sub">Append-only, forever. Filter via <code>/api/admin/logs?limit=&action=&actorId=</code></p>
</div>

<div class="panel">
	<div class="table-wrap">
		<table class="table">
			<thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th><th>IP</th></tr></thead>
			<tbody>
				{#each logs as l}
					<tr>
						<td class="mono-sm">{new Date(l.createdAt).toLocaleString()}</td>
						<td class="mono">{l.action}</td>
						<td class="muted">{l.actorRole} {l.actorId?.slice(-4) ?? ''}</td>
						<td class="muted">{l.targetCollection}:{l.targetId?.slice(-4) ?? ''}</td>
						<td class="mono-sm">{l.ip}</td>
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
	.sub { margin: 8px 0 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; }
	.sub code { background: var(--surface-2); border: 1px solid var(--border); padding: 1px 5px; border-radius: 6px; font-size: 0.78rem; font-family: ui-monospace, monospace; }
	.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-top: 16px; overflow: clip; }
	.table-wrap { overflow-x: auto; }
	.table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
	.table th { text-align: left; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; padding: 8px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }
	.table td { padding: 9px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }
	.mono { font-weight: 600; font-family: ui-monospace, monospace; font-size: 0.78rem; }
	.mono-sm { font-family: ui-monospace, monospace; font-size: 0.78rem; color: var(--text-muted); }
	.muted { color: var(--text-muted); font-size: 0.82rem; }
</style>
