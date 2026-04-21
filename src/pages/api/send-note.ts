/**
 * API Route: POST /api/send-note
 * 
 * Send a new note to a tenant database with Master DB sync.
 * This endpoint demonstrates the multi-tenant architecture:
 * 1. Receives note data + project slug from client
 * 2. Fetches Turso credentials from Master DB
 * 3. Creates note in Tenant DB
 * 4. Syncs metadata (unread status) to Master DB
 * 
 * Request Body:
 * {
 *   slug: string;           // Project slug
 *   content: string;        // Note content
 *   authorName: string;     // Display name (from LocalStorage)
 *   authorRole: 'admin' | 'client';
 *   attachmentUrl?: string;   // Optional file attachment
 *   attachmentType?: string;
 *   attachmentName?: string;
 * }
 */

import type { APIRoute } from 'astro';
import { createNoteInTenant } from '../../lib/turso-tenant';
import { getMasterDb } from '../../lib/turso-master';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const {
      slug,
      content,
      authorName,
      authorRole = 'client',
      attachmentUrl,
      attachmentType,
      attachmentName,
    } = body;

    // Validate required fields
    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Project slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Note content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!authorName || typeof authorName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Author name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate authorRole
    if (authorRole !== 'admin' && authorRole !== 'client') {
      return new Response(
        JSON.stringify({ error: 'Invalid authorRole. Must be "admin" or "client"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Verify project exists and is active
    const masterDb = await getMasterDb();
    const projectResult = await (masterDb as any)
      .select({
        id: projects.id,
        name: projects.name,
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

    // Check if project is accessible (not in draft for clients)
    if (authorRole === 'client' && project.status === 'draft') {
      return new Response(
        JSON.stringify({ error: 'Project is not yet available' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2 & 3: Create note in Tenant DB with Master DB sync
    // The createNoteInTenant function handles both operations:
    // - Insert into Tenant DB
    // - Update has_unread and last_activity_at in Master DB
    const note = await createNoteInTenant(slug, {
      content: content.trim(),
      authorRole,
      authorName: authorName.trim(),
      attachmentUrl,
      attachmentType,
      attachmentName,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          note: {
            id: note.id,
            content: note.content,
            authorRole: note.authorRole,
            authorName: note.authorName,
            createdAt: note.createdAt,
          },
          project: {
            id: project.id,
            name: project.name,
          },
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-note API:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (error.message.includes('not have Turso database configured')) {
        return new Response(
          JSON.stringify({ 
            error: 'Tenant database not configured',
            details: error.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (error.message.includes('Invalid Turso database URL')) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid database configuration',
            details: error.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generic error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send note',
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
