/**
 * Turso Tenant Database Client (Dynamic)
 * 
 * This module provides dynamic client creation for multi-tenant Turso databases.
 * Each tenant database contains only the 'notes' table.
 * 
 * Architecture:
 * - Master DB: stores projects with turso_db_url and turso_db_token
 * - Tenant DBs: isolated per project, store only notes
 * 
 * Serverless/Edge Optimized:
 * - Uses @libsql/client for LibSQL connections
 * - No persistent connections, creates new client per request
 * - Efficient for Vercel Edge Functions, Cloudflare Workers, etc.
 */

import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient, type Client, type Config as LibsqlConfig } from '@libsql/client';
import { eq, desc } from 'drizzle-orm';
import { notes, projects } from '../db/schema';
import { getMasterDb } from './turso-master';

// Tenant schema only includes notes table
type TenantSchema = {
  notes: typeof notes;
};

/**
 * Get a Drizzle client for a specific tenant database
 * 
 * This function creates a dynamic connection to a tenant database
 * using the provided Turso credentials.
 * 
 * @param dbUrl - Turso database URL (libsql://...)
 * @param dbToken - Turso database auth token
 * @returns Drizzle ORM instance for the tenant database
 * 
 * @example
 * const tenantDb = await getTenantClient(
 *   'libsql://tenant-my-project-abc123-myorg.turso.io',
 *   'eyJhbGciOiJF...'
 * );
 * const allNotes = await tenantDb.select().from(notes);
 */
export function getTenantClient(
  dbUrl: string,
  dbToken: string
): LibSQLDatabase<TenantSchema> {
  // Validate inputs
  if (!dbUrl || !dbUrl.startsWith('libsql://')) {
    throw new Error('Invalid Turso database URL. Must start with libsql://');
  }
  if (!dbToken) {
    throw new Error('Database token is required');
  }
  
  // Create LibSQL client for this tenant
  const clientConfig: LibsqlConfig = {
    url: dbUrl,
    authToken: dbToken,
  };
  
  const client = createClient(clientConfig);
  
  // Create Drizzle ORM instance with only notes schema
  const db = drizzle(client, {
    schema: { notes },
  });
  
  return db;
}

/**
 * Get tenant client by project slug
 * 
 * Fetches credentials from Master DB and creates tenant client.
 * This is the recommended way to connect to tenant databases.
 * 
 * @param slug - Project slug
 * @returns Drizzle ORM instance for the tenant database
 * @throws Error if project not found or missing Turso credentials
 */
export async function getTenantClientBySlug(
  slug: string
): Promise<LibSQLDatabase<TenantSchema>> {
  const masterDb = await getMasterDb();
  
  // Fetch project with Turso credentials from Master DB
  const projectResult = await (masterDb as any)
    .select({
      tursoDbUrl: projects.tursoDbUrl,
      tursoDbToken: projects.tursoDbToken,
    })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  
  if (projectResult.length === 0) {
    throw new Error(`Project with slug "${slug}" not found`);
  }
  
  const project = projectResult[0];
  
  if (!project.tursoDbUrl || !project.tursoDbToken) {
    throw new Error(
      `Project "${slug}" does not have Turso database configured. ` +
      `Please run migration to set up tenant database.`
    );
  }
  
  return getTenantClient(project.tursoDbUrl, project.tursoDbToken);
}

/**
 * Sync Master DB when new note is added
 * 
 * Updates has_unread and last_activity_at in Master DB.
 * This is called as a side-effect after inserting a note in Tenant DB.
 * 
 * @param slug - Project slug
 * @param authorRole - Role of the note author ('admin' | 'client')
 */
export async function syncMasterDbOnNewNote(
  slug: string,
  authorRole: 'admin' | 'client'
): Promise<void> {
  const masterDb = await getMasterDb();
  
  // Only mark as unread if message is from client
  const hasUnread = authorRole === 'client';
  
  await masterDb
    .update(projects)
    .set({
      hasUnread,
      lastActivityAt: new Date(),
    })
    .where(eq(projects.slug, slug));
}

/**
 * Mark project as read (admin has viewed messages)
 */
export async function markProjectAsRead(slug: string): Promise<void> {
  const masterDb = await getMasterDb();
  
  await masterDb
    .update(projects)
    .set({
      hasUnread: false,
    })
    .where(eq(projects.slug, slug));
}

/**
 * Create a new note in tenant DB with Master DB sync
 * 
 * This is the main function for adding notes. It:
 * 1. Inserts note into the tenant database
 * 2. Syncs metadata to Master DB (unread status, activity time)
 * 
 * @param slug - Project slug
 * @param data - Note data
 * @returns Created note
 */
export async function createNoteInTenant(
  slug: string,
  data: {
    content: string;
    authorRole: 'admin' | 'client';
    authorName: string;
    attachmentUrl?: string;
    attachmentType?: string;
    attachmentName?: string;
  }
) {
  // Get tenant client
  const tenantDb = await getTenantClientBySlug(slug);
  
  // Insert note into tenant database
  const result = await tenantDb
    .insert(notes)
    .values({
      content: data.content,
      authorRole: data.authorRole,
      authorName: data.authorName,
      attachmentUrl: data.attachmentUrl,
      attachmentType: data.attachmentType,
      attachmentName: data.attachmentName,
      createdAt: new Date(),
    })
    .returning();
  
  // Sync to Master DB (side-effect)
  await syncMasterDbOnNewNote(slug, data.authorRole);
  
  return result[0];
}

/**
 * Get all notes from tenant database
 * 
 * @param slug - Project slug
 * @returns Array of notes ordered by created_at DESC
 */
export async function getNotesFromTenant(slug: string) {
  const tenantDb = await getTenantClientBySlug(slug);
  
  return tenantDb
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt));
}

/**
 * Delete a note from tenant database
 * 
 * @param slug - Project slug
 * @param noteId - Note ID to delete
 */
export async function deleteNoteFromTenant(
  slug: string,
  noteId: number
): Promise<void> {
  const tenantDb = await getTenantClientBySlug(slug);
  
  await tenantDb
    .delete(notes)
    .where(eq(notes.id, noteId));
}

/**
 * Initialize tenant database schema
 * 
 * Creates the notes table in a fresh tenant database.
 * Call this after creating a new Turso database via Platform API.
 * 
 * @param dbUrl - Turso database URL
 * @param dbToken - Turso database auth token
 */
export async function initTenantSchema(
  dbUrl: string,
  dbToken: string
): Promise<void> {
  const client = createClient({
    url: dbUrl,
    authToken: dbToken,
  });
  
  // Execute schema creation
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author_role TEXT NOT NULL DEFAULT 'client',
      author_name TEXT NOT NULL DEFAULT 'Client',
      attachment_url TEXT,
      attachment_type TEXT,
      attachment_name TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  
  await client.close();
}

// Export types
export type TenantDb = LibSQLDatabase<TenantSchema>;
