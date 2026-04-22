import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, desc } from 'drizzle-orm';
import { notes } from '../db/schema';
// Lazy imports to avoid Cloudflare Workers module-level execution
async function getMasterDb() {
  const { getMasterDb: getDb } = await import('./turso-master');
  return getDb();
}

async function ensureNotesDir() {
  const { ensureNotesDir: ensure } = await import('./master-db');
  return ensure();
}
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const DB_DIR = './db';
const NOTES_DIR = `${DB_DIR}/notes`;

// Cache untuk tenant DB instances
const tenantDbCache = new Map<string, ReturnType<typeof drizzle>>();

// Initialize Tenant DB schema
function initTenantSchema(sqlite: Database.Database) {
  sqlite.exec(`
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
}

// Get or create tenant DB instance for a project
export async function getTenantDb(slug: string) {
  // Check cache first
  if (tenantDbCache.has(slug)) {
    return tenantDbCache.get(slug)!;
  }

  // Ensure notes directory exists (local dev only)
  await ensureNotesDir();

  const dbPath = `${NOTES_DIR}/note-${slug}.db`;
  const dbExists = existsSync(dbPath);

  // Create parent directory if needed
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  
  // Initialize schema if new DB
  if (!dbExists) {
    initTenantSchema(sqlite);
  }

  const db = drizzle(sqlite, { schema: { notes } });
  
  // Cache the instance
  tenantDbCache.set(slug, db);
  
  return db;
}

// Sync Master DB when new note is added (client message = unread)
export async function syncMasterDbOnNewNote(
  slug: string, 
  authorRole: 'admin' | 'client'
) {
  const { projects } = await import('../db/schema');
  
  // Only mark as unread if message is from client
  const hasUnread = authorRole === 'client';
  
  const db = await getMasterDb();
  await (db as any)
    .update(projects)
    .set({
      hasUnread,
      lastActivityAt: new Date(),
    })
    .where(eq(projects.slug, slug));
}

// Mark project as read (admin has viewed messages)
export async function markProjectAsRead(slug: string) {
  const { projects } = await import('../db/schema');
  
  const db = await getMasterDb();
  await (db as any)
    .update(projects)
    .set({
      hasUnread: false,
    })
    .where(eq(projects.slug, slug));
}

// Create note in tenant DB with sync to Master DB
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
  const db = await getTenantDb(slug);
  
  const result = await db.insert(notes).values({
    content: data.content,
    authorRole: data.authorRole,
    authorName: data.authorName,
    attachmentUrl: data.attachmentUrl,
    attachmentType: data.attachmentType,
    attachmentName: data.attachmentName,
    createdAt: new Date(),
  }).returning();

  // Sync to Master DB
  await syncMasterDbOnNewNote(slug, data.authorRole);
  
  return result[0];
}

// Get all notes from tenant DB
export async function getNotesFromTenant(slug: string) {
  const db = await getTenantDb(slug);
  
  return db.select().from(notes).orderBy(desc(notes.createdAt));
}

// Delete note from tenant DB
export async function deleteNoteFromTenant(slug: string, noteId: number) {
  const db = await getTenantDb(slug);
  
  return db.delete(notes).where(eq(notes.id, noteId));
}

// Clear cache (useful for testing or when DB files change externally)
export function clearTenantDbCache() {
  tenantDbCache.clear();
}
