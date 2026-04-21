/**
 * API Route: POST /api/mark-read
 * 
 * Mark a project as read by setting has_unread = false in Master DB.
 * Call this when an admin views the project's messages.
 * 
 * Request Body:
 * {
 *   slug: string;  // Project slug
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     slug: string;
 *     markedAsRead: boolean;
 *   }
 * }
 */

import type { APIRoute } from 'astro';
import { markProjectAsRead } from '../../lib/turso-tenant';
import { getMasterDb } from '../../lib/turso-master';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { slug } = body;

    // Validate required fields
    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Project slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify project exists
    const masterDb = await getMasterDb();
    const projectResult = await (masterDb as any)
      .select({
        id: projects.id,
        hasUnread: projects.hasUnread,
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

    // Mark as read
    await markProjectAsRead(slug);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          slug,
          wasUnread: project.hasUnread,
          markedAsRead: true,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mark-read API:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to mark project as read',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
