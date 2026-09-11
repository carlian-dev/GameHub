import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
	// Already authenticated → redirect to role-appropriate board
	if (locals.user) {
		if (locals.user.role === 'ADMIN') throw redirect(302, '/dashboard');
		throw redirect(302, '/board');
	}
	return {
		googleClientId: env.GOOGLE_CLIENT_ID ?? (env as any).PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? process.env.PUBLIC_GOOGLE_CLIENT_ID ?? null
	};
};
