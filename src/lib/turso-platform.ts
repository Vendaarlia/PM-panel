/**
 * Turso Platform API Integration
 * 
 * This module handles programmatic creation of Turso databases for multi-tenant architecture.
 * Each project gets its own isolated database.
 * 
 * Required Environment Variables:
 * - TURSO_PLATFORM_API_TOKEN: API token from Turso dashboard (Settings > API Tokens)
 * - TURSO_ORGANIZATION: Your Turso organization name
 * - TURSO_GROUP: (Optional) Group name to organize tenant databases
 * - TURSO_LOCATION: (Optional) Primary location for new databases (default: sin)
 */

// Turso Platform API Base URL
const TURSO_API_BASE = 'https://api.turso.tech/v1';

interface TursoDatabase {
  Name: string;
  Hostname: string;
  DbId?: string;
  IssuedCertCount?: number;
  IssuedCertLimit?: number;
}

interface TursoToken {
  token: string;
  permissions: string;
}

interface CreateDatabaseResponse {
  database: TursoDatabase;
}

interface CreateTokenResponse {
  token: TursoToken;
}

// Helper to get env var from multiple sources (Node.js process.env or Astro import.meta.env)
function getEnvVar(name: string): string | undefined {
  // Try process.env first (Node.js/Local dev)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  // Try import.meta.env (Astro)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  return undefined;
}

// Get API token from environment
function getApiToken(): string {
  const token = getEnvVar('TURSO_PLATFORM_API_TOKEN');
  if (!token) {
    throw new Error('TURSO_PLATFORM_API_TOKEN environment variable is required');
  }
  return token;
}

function getOrganization(): string {
  const org = getEnvVar('TURSO_ORGANIZATION');
  if (!org) {
    throw new Error('TURSO_ORGANIZATION environment variable is required');
  }
  return org;
}

function getGroup(): string | undefined {
  return getEnvVar('TURSO_GROUP');
}

function getLocation(): string {
  return getEnvVar('TURSO_LOCATION') || 'sin'; // Default to Singapore
}

/**
 * Create a new tenant database using Turso Platform API
 * 
 * @param projectSlug - The project slug used to generate database name
 * @returns Object containing database URL and token for tenant access
 * 
 * @example
 * const { dbUrl, dbToken } = await createTenantDatabase('my-project');
 * // dbUrl = 'libsql://my-project-tenant-[org].turso.io'
 * // dbToken = 'eyJhbGciOiJF...'
 */
export async function createTenantDatabase(projectSlug: string): Promise<{
  dbUrl: string;
  dbToken: string;
}> {
  const apiToken = getApiToken();
  const organization = getOrganization();
  const group = getGroup();
  const location = getLocation();
  
  // Generate unique database name with timestamp to avoid conflicts
  const timestamp = Date.now().toString(36);
  const dbName = `tenant-${projectSlug}-${timestamp}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  // 1. Create the database via Turso Platform API
  // Build request body - either group or seed must be set
  const requestBody: Record<string, string> = {
    name: dbName,
    location,
  };
  if (group && group.trim() !== '') {
    requestBody.group = group;
  }
  // If no group, we need a seed database
  // Use 'empty' or create a dedicated empty template database
  if (!group || group.trim() === '') {
    requestBody.seed = 'empty';  // Use Turso's built-in empty database as seed
  }
  
  console.log('[createTenantDatabase] Creating DB with body:', JSON.stringify(requestBody));
  
  const createDbResponse = await fetch(
    `${TURSO_API_BASE}/organizations/${organization}/databases`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );
  
  if (!createDbResponse.ok) {
    const error = await createDbResponse.text();
    throw new Error(`Failed to create Turso database: ${createDbResponse.status} - ${error}`);
  }
  
  const createDbResult = await createDbResponse.json();
  console.log('[createTenantDatabase] Create DB response:', JSON.stringify(createDbResult, null, 2));
  const database = createDbResult.database;
  
  // 2. Create an auth token for the new database
  // This token will be used by the application to connect to the tenant DB
  const createTokenResponse = await fetch(
    `${TURSO_API_BASE}/organizations/${organization}/databases/${dbName}/auth/tokens`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Grant full access to this specific database
        permissions: {
          read_attach: {
            databases: [dbName],
          },
        },
        // Token expires in 1 year (adjust as needed)
        expiration: '1y',
      }),
    }
  );
  
  if (!createTokenResponse.ok) {
    // Clean up the database if token creation fails
    await deleteTenantDatabase(dbName);
    const error = await createTokenResponse.text();
    throw new Error(`Failed to create database token: ${createTokenResponse.status} - ${error}`);
  }
  
  const tokenResult = await createTokenResponse.json();
  console.log('[createTenantDatabase] Token response:', JSON.stringify(tokenResult, null, 2));
  
  // Handle different response formats
  let dbToken: string;
  if (tokenResult.jwt) {
    // New format: { jwt: "..." }
    dbToken = tokenResult.jwt;
  } else if (tokenResult.token && tokenResult.token.token) {
    // Old format: { token: { token: "..." } }
    dbToken = tokenResult.token.token;
  } else if (typeof tokenResult.token === 'string') {
    // Alternative format: { token: "..." }
    dbToken = tokenResult.token;
  } else {
    console.error('[createTenantDatabase] Unexpected token response format:', tokenResult);
    throw new Error('Unexpected token response format from Turso API');
  }
  
  // 3. Construct the database URL
  // Format: libsql://[hostname]
  const dbUrl = `libsql://${database.Hostname}`;
  console.log('[createTenantDatabase] Constructed URL:', dbUrl);
  
  return {
    dbUrl,
    dbToken,
  };
}

/**
 * Delete a tenant database (useful for cleanup)
 */
export async function deleteTenantDatabase(dbName: string): Promise<void> {
  const apiToken = getApiToken();
  const organization = getOrganization();
  
  const response = await fetch(
    `${TURSO_API_BASE}/organizations/${organization}/databases/${dbName}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    }
  );
  
  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Turso database: ${response.status} - ${error}`);
  }
}

/**
 * List all databases in the organization (useful for debugging)
 */
export async function listDatabases(): Promise<TursoDatabase[]> {
  const apiToken = getApiToken();
  const organization = getOrganization();
  
  const response = await fetch(
    `${TURSO_API_BASE}/organizations/${organization}/databases`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list databases: ${response.status} - ${error}`);
  }
  
  const data = await response.json() as { databases: TursoDatabase[] };
  return data.databases;
}

/**
 * Validate Turso Platform API credentials
 */
export async function validateCredentials(): Promise<boolean> {
  try {
    await listDatabases();
    return true;
  } catch (error) {
    return false;
  }
}
