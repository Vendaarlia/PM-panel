import type { APIRoute } from 'astro';
import { getAllProjects, getProjectById, createProject, updateProjectStatus, deleteProject, updateProject } from '../../lib/query';
import { getUniqueSlug } from '../../lib/slug';
import { createTenantDatabase } from '../../lib/turso-platform';
import { initTenantSchema } from '../../lib/turso-tenant';
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

    // 1. Create project in Master DB (without DB credentials first)
    let project = await createProject({
      name,
      slug,
      client,
      description,
      status,
    });

    console.log('[POST /api/projects] Project created:', project.id, project.slug);

    // 2. Provision Turso tenant database for this project
    try {
      console.log('[POST /api/projects] Provisioning Turso database for slug:', slug);
      
      // Debug: Check all env vars
      const envVars = {
        TURSO_PLATFORM_API_TOKEN: process.env.TURSO_PLATFORM_API_TOKEN ? 'SET' : 'NOT SET',
        TURSO_ORGANIZATION: process.env.TURSO_ORGANIZATION,
        TURSO_LOCATION: process.env.TURSO_LOCATION,
        TURSO_MASTER_DB_URL: process.env.TURSO_MASTER_DB_URL ? 'SET' : 'NOT SET',
      };
      console.log('[POST /api/projects] ENV vars:', envVars);
      
      if (!process.env.TURSO_PLATFORM_API_TOKEN) {
        console.error('[POST /api/projects] ERROR: TURSO_PLATFORM_API_TOKEN is not set!');
        console.error('[POST /api/projects] Please check your .env file');
        throw new Error('TURSO_PLATFORM_API_TOKEN not configured');
      }
      const { dbUrl, dbToken } = await createTenantDatabase(slug);
      console.log('[POST /api/projects] Turso DB created:', dbUrl);

      // 3. Initialize schema in the new tenant database
      await initTenantSchema(dbUrl, dbToken);
      console.log('[POST /api/projects] Tenant schema initialized');

      // 4. Update project with Turso credentials
      console.log('[POST /api/projects] Updating project with credentials:', { 
        projectId: project.id, 
        dbUrl: dbUrl.substring(0, 30) + '...',
        hasToken: !!dbToken 
      });
      project = await updateProject(project.id, {
        tursoDbUrl: dbUrl,
        tursoDbToken: dbToken,
      });
      console.log('[POST /api/projects] Project updated:', {
        id: project.id,
        hasDbUrl: !!project.tursoDbUrl,
        hasDbToken: !!project.tursoDbToken,
      });
    } catch (dbError) {
      console.error('[POST /api/projects] Failed to provision Turso DB:', dbError);
      console.error('[POST /api/projects] Error stack:', dbError instanceof Error ? dbError.stack : 'No stack');
      // Project created but DB provisioning failed
      // Return project anyway with warning, can retry later via provision script
      project = {
        ...project,
        _warning: 'Database provisioning failed: ' + (dbError instanceof Error ? dbError.message : 'Unknown error'),
      };
    }

    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[POST /api/projects] ERROR:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
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

    const projectId = Number(id);

    // 1. Get project details to extract tenant DB name
    const project = await getProjectById(projectId);
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Delete tenant database if exists
    if (project.tursoDbUrl) {
      try {
        // Extract DB name from URL: libsql://[db-name]-[org].[region].turso.io
        // Format: tenant-{slug}-{timestamp}-{organization}.{region}.turso.io
        // We need just: tenant-{slug}-{timestamp}
        const hostnameMatch = project.tursoDbUrl.match(/libsql:\/\/([^\.]+)\./);
        if (hostnameMatch) {
          const fullHostname = hostnameMatch[1]; // e.g., tenant-bluevils-moccyxn6-joomlacort
          // Remove organization suffix
          // Pattern: tenant-{slug}-{timestamp}-{organization}
          // Example: tenant-bluevils-moccyxn6-joomlacort
          // Split and take first 3 parts: tenant + slug + timestamp
          const parts = fullHostname.split('-');
          const dbName = parts.slice(0, 3).join('-');
          console.log(`[DELETE /api/projects] Full hostname: ${fullHostname}`);
          console.log(`[DELETE /api/projects] Extracted DB name: ${dbName}`);
          const { deleteTenantDatabase } = await import('../../lib/turso-platform');
          await deleteTenantDatabase(dbName);
          console.log(`[DELETE /api/projects] Tenant database deleted: ${dbName}`);
        }
      } catch (dbError) {
        console.error(`[DELETE /api/projects] Failed to delete tenant DB:`, dbError);
        // Continue to delete project even if DB deletion fails
      }
    }

    // 3. Delete project from master DB
    await deleteProject(projectId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[DELETE /api/projects] ERROR:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
