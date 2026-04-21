import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { s as schema } from './turso-tenant_B4V9IFI0.mjs';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = "./db";
const MASTER_DB_PATH = `${DB_DIR}/projects.db`;
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}
const sqlite = new Database(MASTER_DB_PATH);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    client TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    share_token TEXT NOT NULL,
    turso_db_url TEXT,
    turso_db_token TEXT,
    has_unread INTEGER NOT NULL DEFAULT 0,
    last_activity_at INTEGER,
    created_at INTEGER NOT NULL
  );
`);
const masterDb = drizzle(sqlite, { schema });
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50);
}
function getUniqueSlug(name, existingSlugs) {
  let slug = generateSlug(name);
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  return slug;
}

export { generateSlug, getUniqueSlug, masterDb };
