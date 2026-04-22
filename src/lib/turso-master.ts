/**
 * Turso Master Database Client
 * 
 * This module provides a LibSQL-based connection to the Master Database.
 * The Master DB stores project metadata and Turso credentials for each tenant.
 * 
 * Environment Variables:
 * - TURSO_MASTER_DB_URL: libsql:// URL for the master database
 * - TURSO_MASTER_DB_TOKEN: Auth token for master database access
 * 
 * For local development, falls back to file-based SQLite.
 */

import { drizzle as drizzleLibsql, LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle as drizzleBetterSqlite3, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { createClient, type Config as LibsqlConfig } from '@libsql/client';
import type { Database as BetterSQLite3DatabaseType } from 'better-sqlite3';
import * as schema from '../db/schema';

// Helper to get env vars - works in both Node.js and Cloudflare Workers
function getEnvVar(name: string): string | undefined {
  // Try Cloudflare Workers runtime first
  if (typeof globalThis !== 'undefined' && (globalThis as any)[name]) {
    return (globalThis as any)[name];
  }
  // Fall back to process.env for Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
}

// Check if we're in a Turso environment
const isTursoEnvironment = !!getEnvVar('TURSO_MASTER_DB_URL') && !!getEnvVar('TURSO_MASTER_DB_TOKEN');

// Type for Master DB - can be either LibSQL (Turso) or BetterSQLite3 (local)
export type MasterDb = LibSQLDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

function createMasterClient() {
  if (isTursoEnvironment) {
    // Production/Edge: Use Turso LibSQL
    const url = getEnvVar('TURSO_MASTER_DB_URL');
    const authToken = getEnvVar('TURSO_MASTER_DB_TOKEN');
    
    console.log('[createMasterClient] Creating Turso client with URL:', url?.substring(0, 20) + '...');
    
    const config: LibsqlConfig = {
      url: url!,
      authToken: authToken!,
    };
    
    return createClient(config);
  } else {
    // Local development: Use file-based SQLite
    // For local dev, we can use the existing better-sqlite3 setup
    // This is imported dynamically to avoid issues in edge environments
    return null;
  }
}

// For Turso/LibSQL environments
let tursoMasterDb: LibSQLDatabase<typeof schema> | null = null;

// For local SQLite environments (lazy-loaded)
let localMasterDb: BetterSQLite3Database<typeof schema> | null = null;

/**
 * Get the Master Database Drizzle instance
 * 
 * This function returns the appropriate Drizzle client based on the environment:
 * - In production/edge: Uses @libsql/client for Turso
 * - In local dev: Falls back to better-sqlite3
 */
export async function getMasterDb(): Promise<MasterDb> {
  console.log('[getMasterDb] Environment check - isTurso:', !!isTursoEnvironment);
  console.log('[getMasterDb] hasUrl:', !!getEnvVar('TURSO_MASTER_DB_URL'), 'hasToken:', !!getEnvVar('TURSO_MASTER_DB_TOKEN'));
  console.log('[getMasterDb] Runtime:', typeof (globalThis as any).WebSocket !== 'undefined' ? 'Cloudflare Workers' : 'Node.js');
  
  if (isTursoEnvironment) {
    console.log('[getMasterDb] Using Turso/LibSQL environment');
    if (!tursoMasterDb) {
      console.log('[getMasterDb] Creating new Turso client...');
      const client = createMasterClient();
      if (client) {
        console.log('[getMasterDb] Client created, initializing drizzle...');
        tursoMasterDb = drizzleLibsql(client, { schema });
      } else {
        console.error('[getMasterDb] Failed to create Turso client');
      }
    } else {
      console.log('[getMasterDb] Reusing existing Turso connection');
    }
    return tursoMasterDb!;
  } else {
    console.log('[getMasterDb] Using local SQLite fallback');
    // Fallback to local SQLite for development
    if (!localMasterDb) {
      const { masterDb } = await import('./master-db');
      localMasterDb = masterDb;
    }
    return localMasterDb!;
  }
}

/**
 * Synchronous version for local development only
 * Throws error if called in Turso environment
 */
export function getMasterDbSync(): BetterSQLite3Database<typeof schema> {
  if (isTursoEnvironment) {
    throw new Error('getMasterDbSync() cannot be used in Turso/Edge environment. Use getMasterDb() instead.');
  }
  
  if (!localMasterDb) {
    // This will only run in local dev where better-sqlite3 is available
    const { masterDb } = require('./master-db');
    localMasterDb = masterDb;
  }
  return localMasterDb!;
}

// Re-export schema helpers for convenience
export { schema };
