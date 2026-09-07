<script lang="ts">
	import AppNav from '$lib/components/AppNav.svelte';
	let { data, children } = $props();

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

<AppNav
	variant="cashier"
	user={data.user}
	links={[
		{ label: 'Board', href: '/board' },
		{ label: 'Hall', href: '/' }
	]}
	onLogout={logout}
/>

<main class="main">
	{@render children()}
</main>

<style>
	.main {
		width: min(var(--content-width), calc(100% - 32px));
		margin: 0 auto;
		padding: 24px 0 32px;
	}
	@media (min-width: 880px) {
		.main { width: min(var(--content-width), calc(100% - 48px)); }
	}
</style>
