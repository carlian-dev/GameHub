import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/mongo';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	const db = await getDb();
	const cashiers = await db.collection('users').find({ role: 'CASHIER' }, { projection: { passwordHash: 0 } }).sort({ username: 1 }).toArray();
	return {
		cashiers: cashiers.map((c) => ({
			_id: c._id.toString(),
			username: c.username,
			displayName: c.displayName,
			status: c.status,
			email: (c as any).email ?? null,
			googleId: (c as any).googleId ?? null,
			createdAt: c.createdAt?.toISOString()
		})),
		googleClientId: env.GOOGLE_CLIENT_ID ?? (env as any).PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? null
	};
};
