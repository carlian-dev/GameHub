import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/mongo';
import { createAuthSession, getCookieOptions } from '$lib/server/auth/session';
import { errorJson, successJson } from '$lib/server/utils/response';
import { logActivity } from '$lib/server/utils/activity';
import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';

const attempts = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const arr = attempts.get(ip) ?? [];
	const recent = arr.filter((t) => now - t < 60_000);
	recent.push(now);
	attempts.set(ip, recent);
	return recent.length > 5;
}

function getIp(event: Parameters<RequestHandler>[0]): string {
	return (
		event.getClientAddress?.() ??
		event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'unknown'
	);
}

function getGoogleClientId(): string | null {
	return env.GOOGLE_CLIENT_ID ?? (env as any).PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? process.env.PUBLIC_GOOGLE_CLIENT_ID ?? null;
}

export const POST: RequestHandler = async (event) => {
	const ip = getIp(event);

	if (isRateLimited(ip)) {
		await logActivity({ action: 'LOGIN_RATE_LIMITED', ip });
		return errorJson(429, 'E_RATE_LIMITED', 'Too many login attempts, try again in a minute');
	}

	const googleClientId = getGoogleClientId();
	if (!googleClientId) {
		console.error('[google auth] GOOGLE_CLIENT_ID not configured');
		return errorJson(500, 'E_GOOGLE_NOT_CONFIGURED', 'Google Sign-In not configured');
	}

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return errorJson(400, 'E_INVALID_JSON', 'Invalid JSON body');
	}

	const credential = (body as any)?.credential;
	if (typeof credential !== 'string' || credential.length < 50 || credential.length > 5000) {
		return errorJson(400, 'E_VALIDATION', 'Invalid credential', {
			fieldErrors: { credential: ['Invalid Google credential'] }
		});
	}

	// Verify ID token server-side — never trust client
	let payload: any;
	try {
		const client = new OAuth2Client(googleClientId);
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: googleClientId
		});
		payload = ticket.getPayload();
		if (!payload) throw new Error('No payload');
		// Extra checks (verifyIdToken already checks aud/exp/iss/signature)
		if (payload.aud !== googleClientId) throw new Error('Invalid audience');
		if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
			throw new Error('Invalid issuer');
		}
		if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expired');
	} catch (e) {
		console.error('[google auth] verify failed', e);
		await logActivity({ action: 'LOGIN_GOOGLE_FAILED', ip, targetCollection: 'users', targetId: null });
		return errorJson(401, 'E_INVALID_GOOGLE_TOKEN', 'Invalid Google credential');
	}

	const googleId: string = payload.sub;
	const googleEmail: string | undefined = payload.email?.toLowerCase?.();

	if (!googleId || typeof googleId !== 'string') {
		return errorJson(401, 'E_INVALID_GOOGLE_TOKEN', 'Invalid Google credential');
	}

	const db = await getDb();

	// Find linked GameHub staff account by stable googleId — do NOT auto-create
	const user = await db.collection('users').findOne({ googleId });

	if (!user) {
		await logActivity({ action: 'LOGIN_GOOGLE_LINK_REQUIRED', ip, targetCollection: 'users', targetId: null });
		return errorJson(403, 'E_LINK_REQUIRED', 'Google account not linked. Ask admin to link your Google account to your staff account.');
	}

	if (user.status !== 'ACTIVE') {
		await logActivity({
			actorId: user._id,
			actorRole: user.role,
			action: 'LOGIN_GOOGLE_FAILED',
			ip,
			targetCollection: 'users',
			targetId: user._id
		});
		return errorJson(401, 'E_INVALID_CREDENTIALS', 'Account disabled');
	}

	// Only ADMIN/CASHIER allowed for staff login — same as existing login (GUEST not staff)
	if (user.role !== 'ADMIN' && user.role !== 'CASHIER') {
		return errorJson(403, 'E_FORBIDDEN', 'Forbidden');
	}

	// Optional: if stored email exists, ensure it matches Google email when available
	// Do not auto-link by email — admin must have linked via googleId
	// Keep existing session mechanism
	const userAgent = event.request.headers.get('user-agent');
	const { token, expiresAt } = await createAuthSession(user._id, user.role, ip, userAgent);

	const isSecure = event.url.protocol === 'https:';
	event.cookies.set('auth_token', token, getCookieOptions(expiresAt, isSecure));

	await logActivity({
		actorId: user._id,
		actorRole: user.role,
		action: 'LOGIN_GOOGLE',
		ip,
		targetCollection: 'users',
		targetId: user._id
	});

	return successJson(
		{
			user: {
				_id: user._id.toString(),
				username: user.username,
				role: user.role,
				displayName: user.displayName
			}
		},
		200
	);
};
