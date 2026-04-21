import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  client: text('client').notNull(),
  description: text('description'),
  status: text('status', { enum: ['draft', 'review', 'done'] }).notNull().default('draft'),
  shareToken: text('share_token').notNull().$default(() => randomUUID()),
  // Turso Multi-Tenant fields
  tursoDbUrl: text('turso_db_url'), // libsql://[db-name]-[org].turso.io
  tursoDbToken: text('turso_db_token'), // JWT token for tenant DB access
  hasUnread: integer('has_unread', { mode: 'boolean' }).notNull().default(false),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).$default(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
});

// Notes table - only used in Tenant DBs (note-[slug].db)
// Master DB does not contain notes table
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  authorRole: text('author_role', { enum: ['admin', 'client'] }).notNull().default('client'),
  authorName: text('author_name').notNull().default('Client'),
  attachmentUrl: text('attachment_url'),
  attachmentType: text('attachment_type'),
  attachmentName: text('attachment_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// Helper type for project metadata
export type ProjectMetadata = Pick<Project, 'id' | 'name' | 'slug' | 'hasUnread' | 'lastActivityAt'>;
