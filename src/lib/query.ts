import { eq, desc } from 'drizzle-orm';
import { getMasterDb } from './turso-master';
import { 
  getTenantClient,
  createNoteInTenant,
  getNotesFromTenant,
  deleteNoteFromTenant,
  deleteAllNotesFromTenant,
  markProjectAsRead
} from './turso-tenant';
import { users, projects, type NewUser, type NewProject } from '../db/schema';

// Helper to get DB instance
async function getDb() {
  return getMasterDb();
}

// User queries
export async function getUserByEmail(email: string) {
  const db = await getDb();
  return (db as any).query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserById(id: number) {
  const db = await getDb();
  return (db as any).query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function createUser(data: NewUser) {
  const db = await getDb();
  const result = await (db as any).insert(users).values(data).returning();
  return result[0];
}

export async function getAllProjects() {
  console.log('[getAllProjects] Starting...');
  try {
    console.log('[getAllProjects] Calling getDb...');
    const db = await getDb();
    console.log('[getAllProjects] DB acquired, querying projects...');
    const result = await (db as any).query.projects.findMany({
      orderBy: desc(projects.createdAt),
    });
    console.log('[getAllProjects] Success, found', result?.length || 0, 'projects');
    return result;
  } catch (error) {
    console.error('[getAllProjects] ERROR:', error);
    console.error('[getAllProjects] Stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

export async function getProjectById(id: number) {
  const db = await getDb();
  return (db as any).query.projects.findFirst({
    where: eq(projects.id, id),
  });
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  return (db as any).query.projects.findFirst({
    where: eq(projects.slug, slug),
  });
}

export async function createProject(data: NewProject) {
  const db = await getDb();
  const result = await (db as any).insert(projects).values(data).returning();
  return result[0];
}

export async function updateProjectStatus(id: number, status: 'draft' | 'review' | 'done') {
  const db = await getDb();
  const result = await (db as any)
    .update(projects)
    .set({ status })
    .where(eq(projects.id, id))
    .returning();
  return result[0];
}

export async function deleteProject(id: number) {
  const db = await getDb();
  
  // Get project first to get the slug for deleting notes
  const project = await (db as any).query.projects.findFirst({
    where: eq(projects.id, id),
  });
  
  if (project) {
    // Delete all notes from tenant DB
    try {
      await deleteAllNotesFromTenant(project.slug);
      console.log(`[deleteProject] Deleted all notes for project ${project.slug}`);
    } catch (error) {
      console.error(`[deleteProject] Failed to delete notes for ${project.slug}:`, error);
      // Continue to delete project even if notes deletion fails
    }
  }
  
  // Delete project from master DB
  return (db as any).delete(projects).where(eq(projects.id, id));
}

// Multi-Tenant Notes Operations
// Notes are now stored in individual tenant DBs based on project slug

export async function getNotesByProjectSlug(slug: string) {
  return getNotesFromTenant(slug);
}

// For backward compatibility - get project first then fetch notes
export async function getNotesByProjectId(projectId: number) {
  const project = await getProjectById(projectId);
  if (!project) return [];
  return getNotesFromTenant(project.slug);
}

export async function createNote(data: {
  slug: string;
  content: string;
  authorRole: 'admin' | 'client';
  authorName: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
}) {
  return createNoteInTenant(data.slug, {
    content: data.content,
    authorRole: data.authorRole,
    authorName: data.authorName,
    attachmentUrl: data.attachmentUrl,
    attachmentType: data.attachmentType,
    attachmentName: data.attachmentName,
  });
}

export async function deleteNote(slug: string, noteId: number) {
  return deleteNoteFromTenant(slug, noteId);
}

export async function markAsRead(slug: string) {
  return markProjectAsRead(slug);
}

export async function getProjectByShareToken(token: string) {
  const db = await getDb();
  return (db as any).query.projects.findFirst({
    where: eq(projects.shareToken, token),
  });
}

export async function updateProjectStatusByShareToken(token: string, status: 'draft' | 'review' | 'done') {
  const db = await getDb();
  const result = await (db as any)
    .update(projects)
    .set({ status })
    .where(eq(projects.shareToken, token))
    .returning();
  return result[0];
}
