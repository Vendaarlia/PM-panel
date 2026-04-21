import type { APIRoute } from 'astro';
import { getProjectByShareToken, getNotesByProjectSlug, createNote, deleteNote } from '../../../lib/query';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = await getProjectByShareToken(token);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const notes = await getNotesByProjectSlug(project.slug);
    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { shareToken, content, authorRole, authorName } = body;

    if (!shareToken || !content) {
      return new Response(
        JSON.stringify({ error: 'Share token and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = await getProjectByShareToken(shareToken);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const note = await createNote({
      slug: project.slug,
      content,
      authorRole: authorRole || 'client',
      authorName: authorName || 'Client',
      attachmentUrl: body.attachment?.url,
      attachmentType: body.attachment?.type,
      attachmentName: body.attachment?.name,
    });

    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create note' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');

    if (!id || !token) {
      return new Response(
        JSON.stringify({ error: 'Note ID and token are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = await getProjectByShareToken(token);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteNote(project.slug, Number(id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete note' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
