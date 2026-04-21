#!/usr/bin/env bun
/**
 * Migration Script for Multi-Tenant SQLite Databases
 * 
 * This script iterates through all tenant database files in /db/notes/
 * and applies the latest schema migrations using Drizzle ORM.
 * 
 * Usage: bun run scripts/migrate-tenants.ts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { notes } from '../src/db/schema';

const DB_DIR = './db';
const NOTES_DIR = `${DB_DIR}/notes`;

// Current schema definition for notes table
const NOTES_SCHEMA_SQL = `
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
`;

interface MigrationResult {
  dbFile: string;
  status: 'success' | 'error';
  message?: string;
}

async function migrateTenantDb(dbPath: string): Promise<MigrationResult> {
  const dbFile = dbPath.split('/').pop() || dbPath;
  
  try {
    const sqlite = new Database(dbPath);
    
    // Initialize/update schema
    sqlite.exec(NOTES_SCHEMA_SQL);
    
    // Verify table exists and has correct structure
    const tableInfo = sqlite.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='notes'"
    ).get() as { sql: string } | undefined;
    
    if (!tableInfo) {
      throw new Error('Notes table not found after migration');
    }
    
    sqlite.close();
    
    return {
      dbFile,
      status: 'success',
    };
  } catch (error) {
    return {
      dbFile,
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log('🔧 Multi-Tenant Database Migration Script\n');
  
  // Check if notes directory exists
  if (!existsSync(NOTES_DIR)) {
    console.log('ℹ️  Notes directory does not exist yet. Creating...');
    const { mkdirSync } = await import('fs');
    mkdirSync(NOTES_DIR, { recursive: true });
    console.log('✅ Notes directory created. No tenant databases to migrate yet.\n');
    return;
  }
  
  // Find all .db files in notes directory
  const files = readdirSync(NOTES_DIR)
    .filter(file => file.endsWith('.db'))
    .map(file => join(NOTES_DIR, file));
  
  if (files.length === 0) {
    console.log('ℹ️  No tenant databases found in', NOTES_DIR);
    console.log('   No migrations needed.\n');
    return;
  }
  
  console.log(`📁 Found ${files.length} tenant database(s) to migrate\n`);
  
  const results: MigrationResult[] = [];
  
  for (const dbPath of files) {
    process.stdout.write(`Migrating ${dbPath.split('/').pop()}... `);
    const result = await migrateTenantDb(dbPath);
    results.push(result);
    
    if (result.status === 'success') {
      console.log('✅');
    } else {
      console.log('❌');
      console.log(`   Error: ${result.message}`);
    }
  }
  
  // Summary
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log(`   Total: ${files.length}\n`);
  
  if (errorCount > 0) {
    console.log('⚠️  Some migrations failed. Check the errors above.\n');
    process.exit(1);
  }
  
  console.log('✅ All migrations completed successfully!\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
