import { eq, desc } from 'drizzle-orm';
import { p as projects, g as getMasterDb, u as users, d as deleteNoteFromTenant, a as getNotesFromTenant, c as createNoteInTenant, m as markProjectAsRead } from './turso-tenant_B4V9IFI0.mjs';

async function getDb() {
  return getMasterDb();
}
async function getUserByEmail(email) {
  const db = await getDb();
  return db.query.users.findFirst({
    where: eq(users.email, email)
  });
}
async function getUserById(id) {
  const db = await getDb();
  return db.query.users.findFirst({
    where: eq(users.id, id)
  });
}
async function createUser(data) {
  const db = await getDb();
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
async function getAllProjects() {
  const db = await getDb();
  return db.query.projects.findMany({
    orderBy: desc(projects.createdAt)
  });
}
async function getProjectById(id) {
  const db = await getDb();
  return db.query.projects.findFirst({
    where: eq(projects.id, id)
  });
}
async function createProject(data) {
  const db = await getDb();
  const result = await db.insert(projects).values(data).returning();
  return result[0];
}
async function updateProjectStatus(id, status) {
  const db = await getDb();
  const result = await db.update(projects).set({ status }).where(eq(projects.id, id)).returning();
  return result[0];
}
async function deleteProject(id) {
  const db = await getDb();
  return db.delete(projects).where(eq(projects.id, id));
}
async function getNotesByProjectSlug(slug) {
  return getNotesFromTenant(slug);
}
async function getNotesByProjectId(projectId) {
  const project = await getProjectById(projectId);
  if (!project) return [];
  return getNotesFromTenant(project.slug);
}
async function createNote(data) {
  return createNoteInTenant(data.slug, {
    content: data.content,
    authorRole: data.authorRole,
    authorName: data.authorName,
    attachmentUrl: data.attachmentUrl,
    attachmentType: data.attachmentType,
    attachmentName: data.attachmentName
  });
}
async function deleteNote(slug, noteId) {
  return deleteNoteFromTenant(slug, noteId);
}
async function markAsRead(slug) {
  return markProjectAsRead(slug);
}
async function getProjectByShareToken(token) {
  const db = await getDb();
  return db.query.projects.findFirst({
    where: eq(projects.shareToken, token)
  });
}
async function updateProjectStatusByShareToken(token, status) {
  const db = await getDb();
  const result = await db.update(projects).set({ status }).where(eq(projects.shareToken, token)).returning();
  return result[0];
}

export { getUserById as a, getNotesByProjectSlug as b, createUser as c, deleteNote as d, getNotesByProjectId as e, getProjectById as f, getUserByEmail as g, createNote as h, deleteProject as i, getAllProjects as j, createProject as k, getProjectByShareToken as l, markAsRead as m, updateProjectStatusByShareToken as n, updateProjectStatus as u };
