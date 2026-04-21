import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const DB_DIR = './db';
const MASTER_DB_PATH = `${DB_DIR}/projects.db`;

// Ensure db directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(MASTER_DB_PATH);

// Initialize Master DB schema
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

export const masterDb = drizzle(sqlite, { schema });

// Helper to ensure notes directory exists
export function ensureNotesDir(): string {
  const notesDir = `${DB_DIR}/notes`;
  if (!existsSync(notesDir)) {
    mkdirSync(notesDir, { recursive: true });
  }
  return notesDir;
}

// Helper to generate slug from project name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Helper to get unique slug
export function getUniqueSlug(name: string, existingSlugs: string[]): string {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  
  return slug;
}
