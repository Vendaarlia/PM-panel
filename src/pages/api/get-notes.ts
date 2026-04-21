/**
 * API Route: GET /api/get-notes?slug={projectSlug}
 * 
 * Retrieve all notes from a tenant database.
 * Returns notes ordered by created_at DESC (newest first).
 * 
 * Query Parameters:
 * - slug: string (required) - Project slug
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     notes: Note[],
 *     project: { id, name, slug }
 *   }
 * }
 * 
 * Error Response:
 * {
 *   error: string,
 *   message?: string
 * }
 */

import type { APIRoute } from 'astro';
import { getNotesFromTenant, markProjectAsRead } from '../../lib/turso-tenant';
import { getMasterDb } from '../../lib/turso-master';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Get project slug from query params
    const slug = url.searchParams.get('slug');

    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Project slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Master DB to verify project exists
    const masterDb = await getMasterDb();
    const projectResult = await (masterDb as any)
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        status: projects.status,
        tursoDbUrl: projects.tursoDbUrl,
        tursoDbToken: projects.tursoDbToken,
      })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (projectResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const project = projectResult[0];

    // Check if project has Turso database configured
    if (!project.tursoDbUrl || !project.tursoDbToken) {
      return new Response(
        JSON.stringify({
          error: 'Tenant database not configured',
          message: `Project "${slug}" does not have a Turso database configured.`,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get notes from tenant database
    const notes = await getNotesFromTenant(slug);

    // Mark project as read when admin views it
    // (Optional: check auth header to determine if viewer is admin)
    const isAdmin = request.headers.get('x-viewer-role') === 'admin';
    if (isAdmin) {
      await markProjectAsRead(slug);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          notes: notes.map(note => ({
            id: note.id,
            content: note.content,
            authorRole: note.authorRole,
            authorName: note.authorName,
            attachmentUrl: note.attachmentUrl,
            attachmentType: note.attachmentType,
            attachmentName: note.attachmentName,
            createdAt: note.createdAt,
          })),
          project: {
            id: project.id,
            name: project.name,
            slug: project.slug,
            status: project.status,
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-notes API:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (error.message.includes('does not have Turso database configured')) {
        return new Response(
          JSON.stringify({
            error: 'Tenant database not configured',
            message: error.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generic error response
    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve notes',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// For CORS preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-viewer-role',
    },
  });
};
