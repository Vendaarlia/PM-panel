import type { APIRoute } from 'astro';
import { getAllProjects, createProject, updateProjectStatus, deleteProject } from '../../lib/query';
import { getUniqueSlug } from '../../lib/slug';
import type { Project } from '../../db/schema';

export const GET: APIRoute = async () => {
  console.log('[GET /api/projects] Starting request...');
  try {
    console.log('[GET /api/projects] Calling getAllProjects...');
    const projects = await getAllProjects();
    console.log('[GET /api/projects] Success, projects count:', projects.length);
    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GET /api/projects] ERROR:', error);
    console.error('[GET /api/projects] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[GET /api/projects] Environment check:', {
      hasDbUrl: !!process.env.TURSO_MASTER_DB_URL,
      hasDbToken: !!process.env.TURSO_MASTER_DB_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    });
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, client, description, status = 'draft' } = body;

    if (!name || !client) {
      return new Response(
        JSON.stringify({ error: 'Name and client are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all existing projects to generate unique slug
    console.log('[POST /api/projects] Fetching existing projects...');
    const existingProjects = await getAllProjects();
    console.log('[POST /api/projects] Found', existingProjects.length, 'existing projects');
    const existingSlugs = existingProjects.map((p: Project) => p.slug);
    const slug = getUniqueSlug(name, existingSlugs);

    const project = await createProject({
      name,
      slug,
      client,
      description,
      status,
    });

    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: 'ID and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = await updateProjectStatus(id, status);

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteProject(Number(id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
