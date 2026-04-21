import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { desc, eq } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => /* @__PURE__ */ new Date())
});
const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  client: text("client").notNull(),
  description: text("description"),
  status: text("status", { enum: ["draft", "review", "done"] }).notNull().default("draft"),
  shareToken: text("share_token").notNull().$default(() => randomUUID()),
  // Turso Multi-Tenant fields
  tursoDbUrl: text("turso_db_url"),
  // libsql://[db-name]-[org].turso.io
  tursoDbToken: text("turso_db_token"),
  // JWT token for tenant DB access
  hasUnread: integer("has_unread", { mode: "boolean" }).notNull().default(false),
  lastActivityAt: integer("last_activity_at", { mode: "timestamp" }).$default(() => /* @__PURE__ */ new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => /* @__PURE__ */ new Date())
});
const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  authorRole: text("author_role", { enum: ["admin", "client"] }).notNull().default("client"),
  authorName: text("author_name").notNull().default("Client"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  attachmentName: text("attachment_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => /* @__PURE__ */ new Date())
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  notes,
  projects,
  users
}, Symbol.toStringTag, { value: 'Module' }));

const isTursoEnvironment = process.env.TURSO_MASTER_DB_URL && process.env.TURSO_MASTER_DB_TOKEN;
function createMasterClient() {
  if (isTursoEnvironment) {
    const config = {
      url: process.env.TURSO_MASTER_DB_URL,
      authToken: process.env.TURSO_MASTER_DB_TOKEN
    };
    return createClient(config);
  } else {
    return null;
  }
}
let tursoMasterDb = null;
let localMasterDb = null;
async function getMasterDb() {
  if (isTursoEnvironment) {
    if (!tursoMasterDb) {
      const client = createMasterClient();
      if (client) {
        tursoMasterDb = drizzle(client, { schema });
      }
    }
    return tursoMasterDb;
  } else {
    if (!localMasterDb) {
      const { masterDb } = await import('./master-db_DH9oIfpH.mjs');
      localMasterDb = masterDb;
    }
    return localMasterDb;
  }
}

function getTenantClient(dbUrl, dbToken) {
  if (!dbUrl || !dbUrl.startsWith("libsql://")) {
    throw new Error("Invalid Turso database URL. Must start with libsql://");
  }
  if (!dbToken) {
    throw new Error("Database token is required");
  }
  const clientConfig = {
    url: dbUrl,
    authToken: dbToken
  };
  const client = createClient(clientConfig);
  const db = drizzle(client, {
    schema: { notes }
  });
  return db;
}
async function getTenantClientBySlug(slug) {
  const masterDb = await getMasterDb();
  const projectResult = await masterDb.select({
    tursoDbUrl: projects.tursoDbUrl,
    tursoDbToken: projects.tursoDbToken
  }).from(projects).where(eq(projects.slug, slug)).limit(1);
  if (projectResult.length === 0) {
    throw new Error(`Project with slug "${slug}" not found`);
  }
  const project = projectResult[0];
  if (!project.tursoDbUrl || !project.tursoDbToken) {
    throw new Error(
      `Project "${slug}" does not have Turso database configured. Please run migration to set up tenant database.`
    );
  }
  return getTenantClient(project.tursoDbUrl, project.tursoDbToken);
}
async function syncMasterDbOnNewNote(slug, authorRole) {
  const masterDb = await getMasterDb();
  const hasUnread = authorRole === "client";
  await masterDb.update(projects).set({
    hasUnread,
    lastActivityAt: /* @__PURE__ */ new Date()
  }).where(eq(projects.slug, slug));
}
async function markProjectAsRead(slug) {
  const masterDb = await getMasterDb();
  await masterDb.update(projects).set({
    hasUnread: false
  }).where(eq(projects.slug, slug));
}
async function createNoteInTenant(slug, data) {
  const tenantDb = await getTenantClientBySlug(slug);
  const result = await tenantDb.insert(notes).values({
    content: data.content,
    authorRole: data.authorRole,
    authorName: data.authorName,
    attachmentUrl: data.attachmentUrl,
    attachmentType: data.attachmentType,
    attachmentName: data.attachmentName,
    createdAt: /* @__PURE__ */ new Date()
  }).returning();
  await syncMasterDbOnNewNote(slug, data.authorRole);
  return result[0];
}
async function getNotesFromTenant(slug) {
  const tenantDb = await getTenantClientBySlug(slug);
  return tenantDb.select().from(notes).orderBy(desc(notes.createdAt));
}
async function deleteNoteFromTenant(slug, noteId) {
  const tenantDb = await getTenantClientBySlug(slug);
  await tenantDb.delete(notes).where(eq(notes.id, noteId));
}

export { getNotesFromTenant as a, createNoteInTenant as c, deleteNoteFromTenant as d, getMasterDb as g, markProjectAsRead as m, projects as p, schema as s, users as u };
