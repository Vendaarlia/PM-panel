import type { APIRoute } from 'astro';
import { updateProjectStatusByShareToken } from '../../../lib/query';

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, status } = body;

    if (!token || !status) {
      return new Response(
        JSON.stringify({ error: 'Token and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['draft', 'review', 'done'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = await updateProjectStatusByShareToken(token, status as 'draft' | 'review' | 'done');

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
