import type { APIRoute } from 'astro';
import { getUserById } from '../../../lib/query';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const user = await getUserById(session.userId);

    if (!user) {
      cookies.delete('session', { path: '/' });
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        user: { id: user.id, name: user.name, email: user.email }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check auth' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
