#!/usr/bin/env bun
/**
 * Provision New Tenant Database Script
 * 
 * This script creates a new Turso database for a project and updates the Master DB
 * with the credentials. Run this after creating a project in the Master DB.
 * 
 * Usage:
 *   bun run scripts/provision-tenant.ts --slug my-project
 *   bun run scripts/provision-tenant.ts --slug my-project --init-schema
 * 
 * Options:
 *   --slug, -s         Project slug (required)
 *   --init-schema, -i  Initialize notes table schema after creation
 *   --help, -h         Show this help message
 * 
 * Environment Variables Required:
 *   - TURSO_PLATFORM_API_TOKEN
 *   - TURSO_ORGANIZATION
 *   - TURSO_MASTER_DB_URL (or local SQLite fallback)
 *   - TURSO_MASTER_DB_TOKEN (for Turso Master DB)
 */

import { parseArgs } from 'util';
import { createTenantDatabase, validateCredentials } from '../src/lib/turso-platform';
import { getMasterDb } from '../src/lib/turso-master';
import { initTenantSchema } from '../src/lib/turso-tenant';
import { projects } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    slug: {
      type: 'string',
      short: 's',
    },
    'init-schema': {
      type: 'boolean',
      short: 'i',
      default: false,
    },
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help
if (values.help || (!values.slug && positionals.length === 0)) {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           Provision Tenant Database for Project                  ║
╚══════════════════════════════════════════════════════════════════╝

Usage:
  bun run scripts/provision-tenant.ts --slug <project-slug>
  bun run scripts/provision-tenant.ts -s <project-slug> --init-schema

Options:
  --slug, -s         Project slug (required)
  --init-schema, -i  Initialize notes table schema after creation
  --help, -h         Show this help message

Environment Variables Required:
  TURSO_PLATFORM_API_TOKEN    Turso Platform API token
  TURSO_ORGANIZATION            Your Turso organization name
  TURSO_MASTER_DB_URL           Master database URL (libsql://...)
  TURSO_MASTER_DB_TOKEN         Master database auth token

Examples:
  # Provision database for existing project
  bun run scripts/provision-tenant.ts --slug my-project

  # Provision and initialize schema
  bun run scripts/provision-tenant.ts --slug my-project --init-schema

Note:
  The project must already exist in the Master DB before running this script.
  Run 'bun run dbmig' first if you haven't created the projects table.
`);
  process.exit(0);
}

const slug = values.slug || positionals[0];

if (!slug) {
  console.error('❌ Error: Project slug is required');
  console.error('   Use --slug <slug> or -s <slug> to specify the project');
  process.exit(1);
}

async function main() {
  console.log(`\n🔧 Provisioning tenant database for project: ${slug}\n`);

  // Step 1: Validate Turso Platform API credentials
  console.log('1️⃣  Validating Turso Platform API credentials...');
  try {
    const isValid = await validateCredentials();
    if (!isValid) {
      console.error('❌ Failed to validate Turso Platform API credentials');
      console.error('   Check your TURSO_PLATFORM_API_TOKEN and TURSO_ORGANIZATION env vars');
      process.exit(1);
    }
    console.log('   ✅ API credentials valid\n');
  } catch (error) {
    console.error('❌ Error validating credentials:', error);
    process.exit(1);
  }

  // Step 2: Get Master DB and verify project exists
  console.log('2️⃣  Verifying project in Master DB...');
  let masterDb;
  let project;
  try {
    masterDb = await getMasterDb();
    const projectResult = await (masterDb as any)
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        tursoDbUrl: projects.tursoDbUrl,
        tursoDbToken: projects.tursoDbToken,
      })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (projectResult.length === 0) {
      console.error(`❌ Project with slug "${slug}" not found in Master DB`);
      console.error('   Create the project first before provisioning a tenant database');
      process.exit(1);
    }

    project = projectResult[0];
    console.log(`   ✅ Found project: ${project.name} (ID: ${project.id})\n`);

    // Check if already has Turso database
    if (project.tursoDbUrl && project.tursoDbToken) {
      console.log('⚠️  Project already has a Turso database configured:');
      console.log(`   URL: ${project.tursoDbUrl}`);
      console.log('   Use --force to overwrite (not recommended - will orphan existing DB)\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error accessing Master DB:', error);
    process.exit(1);
  }

  // Step 3: Create tenant database via Turso Platform API
  console.log('3️⃣  Creating tenant database via Turso Platform API...');
  let dbUrl: string;
  let dbToken: string;
  try {
    const result = await createTenantDatabase(slug);
    dbUrl = result.dbUrl;
    dbToken = result.dbToken;
    console.log(`   ✅ Database created: ${dbUrl}\n`);
  } catch (error) {
    console.error('❌ Failed to create tenant database:', error);
    process.exit(1);
  }

  // Step 4: Update Master DB with credentials
  console.log('4️⃣  Updating Master DB with credentials...');
  try {
    await (masterDb as any)
      .update(projects)
      .set({
        tursoDbUrl: dbUrl,
        tursoDbToken: dbToken,
      })
      .where(eq(projects.slug, slug));
    console.log('   ✅ Master DB updated\n');
  } catch (error) {
    console.error('❌ Failed to update Master DB:', error);
    console.error('   WARNING: Database was created but credentials were not saved!');
    console.error(`   Manual fix required:`);
    console.error(`   - URL: ${dbUrl}`);
    console.error(`   - Token: ${dbToken.substring(0, 20)}...`);
    process.exit(1);
  }

  // Step 5: Initialize schema (optional)
  if (values['init-schema']) {
    console.log('5️⃣  Initializing notes table schema...');
    try {
      await initTenantSchema(dbUrl, dbToken);
      console.log('   ✅ Schema initialized\n');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error);
      console.log('   ⚠️  You can initialize schema later by calling the API\n');
    }
  }

  // Success summary
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ Tenant Database Provisioned Successfully!        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  console.log(`Project:    ${project.name} (${slug})`);
  console.log(`Database:   ${dbUrl}`);
  console.log(`Token:      ${dbToken.substring(0, 30)}...\n`);
  console.log('Next Steps:');
  console.log('  1. The project is now ready for notes via /api/send-note');
  console.log('  2. Client can view notes via /api/get-notes?slug=' + slug);
  if (!values['init-schema']) {
    console.log('  3. The notes table will be auto-created on first write');
  }
  console.log('');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
