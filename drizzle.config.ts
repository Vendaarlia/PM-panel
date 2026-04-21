import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration for Master Database
 * 
 * Master DB: /db/projects.db - stores project metadata, users, and settings
 * Tenant DBs: /db/notes/note-[slug].db - individual databases for each project
 * 
 * For tenant DB migrations, use: bun run migrate:tenants
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './db/projects.db',
  },
});
