import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/mongo';
import { requireRole } from '$lib/server/auth/rbac';
import { linkGoogleSchema } from '$lib/schemas/cashiers';
import { errorJson, successJson } from '$lib/server/utils/response';
import { logActivity } from '$lib/server/utils/activity';
import { ObjectId } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';

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

export const PATCH: RequestHandler = async (event) => {
	let admin: NonNullable<App.Locals['user']>;
	try {
		admin = requireRole(event, 'ADMIN');
	} catch (e: any) {
		if (e.status === 401) return errorJson(401, 'E_UNAUTHENTICATED', 'Not authenticated');
		return errorJson(403, 'E_FORBIDDEN', 'Forbidden');
	}

	const id = event.params.id;
	if (!ObjectId.isValid(id)) return errorJson(400, 'E_INVALID_ID', 'Invalid user id');

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return errorJson(400, 'E_INVALID_JSON', 'Invalid JSON body');
	}

	const parsed = linkGoogleSchema.safeParse(body);
	if (!parsed.success) {
		return errorJson(400, 'E_VALIDATION', 'Validation failed', { fieldErrors: parsed.error.flatten() });
	}

	const { credential } = parsed.data;

	const googleClientId = getGoogleClientId();
	if (!googleClientId) {
		return errorJson(500, 'E_GOOGLE_NOT_CONFIGURED', 'Google Sign-In not configured');
	}

	// Verify Google ID token server-side — admin session remains auth, credential only identifies Google account to link
	let payload: any;
	try {
		const client = new OAuth2Client(googleClientId);
		const ticket = await client.verifyIdToken({ idToken: credential, audience: googleClientId });
		payload = ticket.getPayload();
		if (!payload) throw new Error('No payload');
		if (payload.aud !== googleClientId) throw new Error('Invalid audience');
		if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') throw new Error('Invalid issuer');
		if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expired');
		if (payload.email_verified === false) throw new Error('Email not verified');
	} catch (e) {
		console.error('[google link] verify failed', e);
		return errorJson(401, 'E_INVALID_GOOGLE_TOKEN', 'Invalid Google credential');
	}

	const googleId: string = payload.sub;
	const email: string | null = payload.email ? String(payload.email).toLowerCase().trim() : null;

	if (!googleId || typeof googleId !== 'string') {
		return errorJson(401, 'E_INVALID_GOOGLE_TOKEN', 'Invalid Google credential');
	}

	const db = await getDb();

	// Check target user exists
	const target = await db.collection('users').findOne({ _id: new ObjectId(id) });
	if (!target) return errorJson(404, 'E_NOT_FOUND', 'User not found');

	// Check googleId uniqueness (sparse) — reject if already linked to another user
	const existingGoogle = await db.collection('users').findOne({ googleId, _id: { $ne: new ObjectId(id) } });
	if (existingGoogle) return errorJson(409, 'E_DUPLICATE_GOOGLE_ID', 'Google account already linked to another user');

	if (email) {
		const existingEmail = await db.collection('users').findOne({ email, _id: { $ne: new ObjectId(id) } });
		if (existingEmail) return errorJson(409, 'E_DUPLICATE_EMAIL', 'Email already linked to another user');
	}

	const now = new Date();
	const updateDoc: any = { $set: { googleId, updatedAt: now } };
	if (email) updateDoc.$set.email = email;
	else updateDoc.$unset = { email: '' };

	await db.collection('users').updateOne({ _id: new ObjectId(id) }, updateDoc);

	const updated = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });

	await logActivity({
		actorId: new ObjectId(admin._id),
		actorRole: admin.role,
		action: 'USER_GOOGLE_LINKED',
		targetCollection: 'users',
		targetId: new ObjectId(id),
		after: { googleId, email },
		ip: getIp(event)
	});

	return successJson({ user: updated });
};

export const DELETE: RequestHandler = async (event) => {
	let admin: NonNullable<App.Locals['user']>;
	try {
		admin = requireRole(event, 'ADMIN');
	} catch (e: any) {
		if (e.status === 401) return errorJson(401, 'E_UNAUTHENTICATED', 'Not authenticated');
		return errorJson(403, 'E_FORBIDDEN', 'Forbidden');
	}

	const id = event.params.id;
	if (!ObjectId.isValid(id)) return errorJson(400, 'E_INVALID_ID', 'Invalid user id');

	const db = await getDb();
	const target = await db.collection('users').findOne({ _id: new ObjectId(id) });
	if (!target) return errorJson(404, 'E_NOT_FOUND', 'User not found');

	await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $unset: { googleId: '', email: '' }, $set: { updatedAt: new Date() } });

	await logActivity({
		actorId: new ObjectId(admin._id),
		actorRole: admin.role,
		action: 'USER_GOOGLE_UNLINKED',
		targetCollection: 'users',
		targetId: new ObjectId(id),
		ip: getIp(event)
	});

	const updated = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });
	return successJson({ user: updated });
};
