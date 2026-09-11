<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initTheme } from '$lib/theme';

	let { children, data } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Prevent FOUC: set theme before hydration -->
	<script>
		(function () {
			try {
				var stored = localStorage.getItem('gamehub-theme');
				var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				var theme = stored === 'light' || stored === 'dark' ? stored : systemDark ? 'dark' : 'light';
				document.documentElement.dataset.theme = theme;
				document.documentElement.style.colorScheme = theme;
			} catch (e) {}
		})();
	</script>
</svelte:head>

{@render children()}

<style>
	/* ── Minimal Apple system ── single source of truth ── */
	:global(:root) {
		--bg: #fbfbfd;
		--surface: #ffffff;
		--surface-2: #f5f5f7;
		--surface-hover: #e8e8ed;
		--text: #1d1d1f;
		--text-secondary: #424245;
		--text-muted: #6e6e73;
		--text-faint: #86868b;
		--border: #e8e8ed;
		--border-strong: #d2d2d7;
		--nav-bg: rgba(251, 251, 253, 0.8);
		--nav-border: rgba(0, 0, 0, 0.06);
		--accent: #0071e3;
		--accent-hover: #0077ed;
		--accent-pressed: #006edb;
		--accent-soft: rgba(0, 113, 227, 0.08);
		--accent-soft-strong: rgba(0, 113, 227, 0.14);
		--success: #1d8127;
		--success-soft: rgba(29, 129, 39, 0.08);
		--danger: #d70015;
		--danger-soft: rgba(215, 0, 21, 0.08);
		--warning: #9a6700;
		--toggle-track: rgba(0, 0, 0, 0.08);
		--toggle-border: rgba(0, 0, 0, 0.1);
		--toggle-thumb: #1d1d1f;
		--toggle-thumb-icon: #ffffff;
		--banner-bg: #f5f5f7;
		--banner-text: #1d1d1f;
		--radius-xs: 10px;
		--radius-sm: 12px;
		--radius-md: 16px;
		--radius-lg: 20px;
		--radius-xl: 24px;
		--radius-pill: 999px;
		--content-width: 1120px;
		--content-pad: 24px;
		--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
		--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
		--shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.08);
		color-scheme: light;
	}
	:global([data-theme='dark']) {
		--bg: #000000;
		--surface: #1c1c1e;
		--surface-2: #2c2c2e;
		--surface-hover: #3a3a3c;
		--text: #f5f5f7;
		--text-secondary: #a1a1a6;
		--text-muted: #86868b;
		--text-faint: #6e6e73;
		--border: #2c2c2e;
		--border-strong: #38383a;
		--nav-bg: rgba(28, 28, 30, 0.72);
		--nav-border: rgba(255, 255, 255, 0.08);
		--accent: #2997ff;
		--accent-hover: #30a2ff;
		--accent-pressed: #0077ed;
		--accent-soft: rgba(41, 151, 255, 0.14);
		--accent-soft-strong: rgba(41, 151, 255, 0.20);
		--success: #30d158;
		--success-soft: rgba(48, 209, 88, 0.14);
		--danger: #ff453a;
		--danger-soft: rgba(255, 69, 58, 0.12);
		--warning: #ffd60a;
		--toggle-track: rgba(255, 255, 255, 0.14);
		--toggle-border: rgba(255, 255, 255, 0.16);
		--toggle-thumb: #f5f5f7;
		--toggle-thumb-icon: #000000;
		--banner-bg: #1c1c1e;
		--banner-text: #f5f5f7;
		color-scheme: dark;
	}
	/* Base */
	:global(html) {
		font: 100%/1.5 system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
		font-optical-sizing: auto;
	}
	:global(*) { box-sizing: border-box; }
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		transition:
			background-color 280ms ease,
			color 280ms ease;
	}
	:global(a) { color: inherit; }
	:global(::selection) { background: var(--accent-soft-strong); }
	/* Eased theme transition */
	:global(html.theme-transition),
	:global(html.theme-transition body) {
		transition:
			background-color 280ms ease,
			color 280ms ease,
			border-color 280ms ease !important;
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html.theme-transition),
		:global(html.theme-transition body) {
			transition: none !important;
		}
	}
	/* Focus */
	:global(:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	/* Reduced transparency */
	@media (prefers-reduced-transparency: reduce) {
		:global(:root) { --nav-bg: var(--surface) !important; }
	}
</style>
