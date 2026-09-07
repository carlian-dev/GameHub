<script lang="ts">
	let username = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);
	let activeField: string | null = $state(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data?.error?.message ?? data?.error?.code ?? 'Login failed';
				return;
			}
			const role = data.data.user.role as string;
			if (role === 'ADMIN') {
				window.location.href = '/dashboard';
			} else {
				window.location.href = '/board';
			}
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Staff Access — GameHub</title>
	<meta name="description" content="Cashier and Admin access for GameHub billiard hall." />
</svelte:head>

<div class="page">
	<a href="/" class="back" aria-label="Back to landing">
		<span aria-hidden="true">←</span> Back to hall
	</a>

	<main class="shell" aria-label="Staff login">
		<!-- Left: brand / context — minimal -->
		<section class="intro" aria-label="GameHub staff">
			<a href="/" class="brand" aria-label="GameHub home">
				<span class="brand-mark" aria-hidden="true"><span class="brand-mark-inner">8</span></span>
				<span class="brand-text">GameHub</span>
			</a>

			<div class="intro-copy">
				<p class="kicker">Staff access</p>
				<h1>Welcome<br />back.</h1>
				<p class="sub">Cashier and Admin only. Guests don’t need an account — reserve directly.</p>

				<div class="meta">
					<div class="meta-item">
						<span class="dot green" aria-hidden="true"></span>
						<span>09:00–02:00 · Live board</span>
					</div>
					<div class="meta-item">
						<span class="dot muted" aria-hidden="true"></span>
						<span>Per-minute · Snapshot pricing</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Right: login card — minimal, clean -->
		<section class="card" aria-label="Sign in">
			<header class="card-head">
				<h2>Sign in</h2>
				<p>Use your staff account. Contact admin if you need access.</p>
			</header>

			<form onsubmit={submit} class="form" novalidate>
				<label class="field" data-active={activeField === 'username'}>
					<span>Username</span>
					<input
						bind:value={username}
						placeholder="admin"
						autocomplete="username"
						required
						aria-required="true"
						onfocus={() => (activeField = 'username')}
						onblur={() => (activeField = null)}
					/>
				</label>

				<label class="field" data-active={activeField === 'password'}>
					<span>Password</span>
					<input
						type="password"
						bind:value={password}
						placeholder="••••••••"
						autocomplete="current-password"
						required
						aria-required="true"
						onfocus={() => (activeField = 'password')}
						onblur={() => (activeField = null)}
					/>
				</label>

				{#if error}
					<div class="alert alert-error" role="alert" aria-live="polite">{error}</div>
				{/if}

				<button type="submit" class="btn btn-primary" disabled={loading} aria-busy={loading}>
					{#if loading}
						<span class="spinner" aria-hidden="true"></span>
						Signing in…
					{:else}
						Sign in
						<span aria-hidden="true" class="btn-arrow">→</span>
					{/if}
				</button>

				<p class="form-foot">Press <kbd>Enter</kbd> to submit · Guests: <a href="/reserve">Reserve →</a></p>
			</form>

			<div class="seed">
				<p class="seed-kicker">Seeded for development</p>
				<div class="seed-grid">
					<div class="seed-item">
						<span class="seed-role">ADMIN</span>
						<code>admin / Admin123!</code>
					</div>
					<div class="seed-item">
						<span class="seed-role">CASHIER</span>
						<code>cashier1 / Cashier123!</code>
					</div>
				</div>
				<p class="seed-note">Change via <code>SEED_ADMIN_*</code> in <code>.env</code>. Never commit real passwords.</p>
			</div>
		</section>
	</main>

	<footer class="foot">
		<span>© 2026 GameHub · Bukidnon</span>
		<span class="foot-dot">·</span>
		<a href="/">Public site</a>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font: 100%/1.5 system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
		-webkit-font-smoothing: antialiased;
		text-rendering: optimizeLegibility;
	}
	.page {
		min-height: 100dvh;
		background: var(--bg);
		display: grid;
		grid-template-rows: auto 1fr auto;
	}
	.back {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 16px auto 0;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.88rem;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	@media (min-width: 880px) {
		.back { width: min(var(--content-width), calc(100% - 48px)); }
	}
	.back:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }
	.shell {
		width: min(960px, calc(100% - 32px));
		margin: 18px auto 24px;
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: 32px;
		align-items: start;
	}
	@media (min-width: 880px) {
		.shell { width: min(960px, calc(100% - 48px)); margin-top: 24px; }
	}
	@media (max-width: 880px) { .shell { grid-template-columns: 1fr; } }
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text);
	}
	.brand-mark {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: var(--text);
		color: var(--bg);
		flex: none;
	}
	:global([data-theme='dark']) .brand-mark { background: #fff; color: #000; }
	.brand-mark-inner {
		width: 20px;
		height: 20px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: -0.02em;
		border: 1.5px solid currentColor;
	}
	.brand-text {
		font-weight: 700;
		letter-spacing: -0.02em;
		font-size: 1.05rem;
	}
	.intro {
		padding: 12px 0 0;
		display: grid;
		gap: 18px;
		align-content: start;
	}
	.kicker {
		margin: 0;
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.intro-copy h1 {
		margin: 6px 0 0;
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		line-height: 0.92;
		letter-spacing: -0.04em;
		font-weight: 700;
	}
	.sub {
		margin: 12px 0 0;
		color: var(--text-muted);
		line-height: 1.6;
		max-width: 42ch;
		font-size: 0.98rem;
	}
	.meta {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 16px;
	}
	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.82rem;
		color: var(--text-muted);
		border: 1px solid var(--border);
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--surface);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		display: inline-block;
	}
	.dot.green { background: var(--success); box-shadow: 0 0 0 3px var(--success-soft); }
	.dot.muted { background: var(--text-faint); }

	/* Card — minimal */
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 22px;
		box-shadow: var(--shadow-md);
	}
	.card-head h2 {
		margin: 0;
		font-size: 1.35rem;
		letter-spacing: -0.02em;
		line-height: 1.05;
		font-weight: 700;
	}
	.card-head p {
		margin: 6px 0 0;
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.form {
		display: grid;
		gap: 14px;
		margin-top: 18px;
	}
	.field {
		display: grid;
		gap: 6px;
	}
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
		padding: 12px 12px;
		font-size: 0.95rem;
		outline: none;
		transition: border-color 160ms ease, box-shadow 160ms ease;
	}
	.field input::placeholder { color: var(--text-faint); }
	.field input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.alert {
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		font-size: 0.88rem;
		line-height: 1.4;
	}
	.alert-error {
		background: var(--danger-soft);
		border: 1px solid rgba(215,0,21,0.18);
		color: var(--danger);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 999px;
		font-weight: 600;
		letter-spacing: -0.01em;
		border: 1px solid transparent;
		cursor: pointer;
		transition: transform 100ms ease-out, background 160ms ease, opacity 160ms ease;
		will-change: transform;
		font-size: 0.92rem;
	}
	.btn:active { transform: scale(0.97); }
	.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
	.btn-primary {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
	}
	:global([data-theme='dark']) .btn-primary { background: #fff; color: #000; border-color: #fff; }
	.btn-primary:hover { opacity: 0.92; }
	.btn-primary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.btn-arrow { opacity: 0.6; }
	.spinner {
		width: 14px;
		height: 14px;
		border-radius: 999px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: currentColor;
		animation: spin 0.7s linear infinite;
	}
	:global([data-theme='light']) .spinner { border-color: rgba(0,0,0,0.14); border-top-color: #000; }
	@keyframes spin { to { transform: rotate(360deg); } }
	@media (prefers-reduced-motion: reduce) {
		.spinner { animation: none; }
		.btn { transition: opacity 160ms ease !important; transform: none !important; }
	}
	.form-foot {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		font-size: 0.84rem;
		color: var(--text-muted);
	}
	.form-foot a { color: var(--text); text-underline-offset: 3px; }
	.form-foot a:hover { color: var(--accent); }
	.form-foot kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.74rem;
		background: var(--surface-2);
		border: 1px solid var(--border);
		padding: 1px 5px;
		border-radius: 6px;
	}
	.seed {
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}
	.seed-kicker {
		margin: 0 0 8px;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
		font-weight: 700;
	}
	.seed-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	@media (max-width: 520px) { .seed-grid { grid-template-columns: 1fr; } }
	.seed-item {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 10px 11px;
		display: grid;
		gap: 4px;
	}
	.seed-role {
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		font-weight: 700;
	}
	.seed-item code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.82rem;
		color: var(--text);
		word-break: break-all;
	}
	.seed-note {
		margin: 8px 0 0;
		font-size: 0.76rem;
		color: var(--text-faint);
		line-height: 1.5;
	}
	.seed-note code {
		font-family: ui-monospace, monospace;
		background: var(--surface-2);
		border: 1px solid var(--border);
		padding: 1px 4px;
		border-radius: 4px;
	}
	.foot {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 0 auto 24px;
		display: flex;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		font-size: 0.82rem;
		color: var(--text-muted);
	}
	@media (min-width: 880px) { .foot { width: min(var(--content-width), calc(100% - 48px)); } }
	.foot a { color: var(--text-muted); text-underline-offset: 3px; }
	.foot a:hover { color: var(--text); }
	.foot-dot { opacity: 0.4; }
</style>
