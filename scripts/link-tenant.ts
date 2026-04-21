#!/usr/bin/env bun
/**
 * Link Tenant Database to Project Script
 * 
 * Use this script when you create a tenant database MANUALLY (via CLI or Dashboard)
 * and want to link it to a project in the Master DB.
 * 
 * This is the FREE PLAN workflow - no Platform API required!
 * 
 * Usage:
 *   bun run scripts/link-tenant.ts --slug my-project --db-url libsql://... --db-token eyJ...
 *   bun run scripts/link-tenant.ts -s my-project -u libsql://tenant-my-project-org.turso.io -t eyJhbG...
 * 
 * Options:
 *   --slug, -s      Project slug (required)
 *   --db-url, -u    Turso database URL libsql://... (required)
 *   --db-token, -t  Turso database auth token (required)
 *   --init-schema   Initialize notes table schema after linking
 *   --help, -h      Show this help message
 * 
 * Example:
 *   # 1. Create tenant DB manually via CLI:
 *   turso db create tenant-my-project
 *   
 *   # 2. Get credentials:
 *   turso db show tenant-my-project    # copy hostname
 *   turso db tokens create tenant-my-project  # copy token
 *   
 *   # 3. Link to project:
 *   bun run scripts/link-tenant.ts \
 *     --slug my-project \
 *     --db-url libsql://tenant-my-project-yourorg.turso.io \
 *     --db-token eyJhbGciOiJF... \
 *     --init-schema
 */

import { parseArgs } from 'util';
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
    'db-url': {
      type: 'string',
      short: 'u',
    },
    'db-token': {
      type: 'string',
      short: 't',
    },
    'init-schema': {
      type: 'boolean',
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
if (values.help) {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║         Link Tenant DB to Project (FREE PLAN Workflow)           ║
╚══════════════════════════════════════════════════════════════════╝

Use this when you create a tenant database MANUALLY via CLI/Dashboard.

Prerequisites:
  1. Master DB is created and configured in .env
  2. Project exists in Master DB
  3. Tenant DB is created manually

Usage:
  bun run scripts/link-tenant.ts --slug <slug> --db-url <url> --db-token <token>

Options:
  --slug, -s       Project slug (required)
  --db-url, -u     Turso database URL: libsql://tenant-name-org.turso.io
  --db-token, -t   Turso database auth token
  --init-schema    Initialize notes table after linking
  --help, -h       Show this help

Example Workflow:
  # 1. Create tenant database manually
  turso db create tenant-my-project

  # 2. Get the database URL
  turso db show tenant-my-project
  # Output: libsql://tenant-my-project-yourorg.turso.io

  # 3. Create auth token
  turso db tokens create tenant-my-project
  # Output: eyJhbGciOiJF...

  # 4. Link to project
  bun run scripts/link-tenant.ts \\
    --slug my-project \\
    --db-url libsql://tenant-my-project-yourorg.turso.io \\
    --db-token eyJhbGciOiJF... \\
    --init-schema

Alternative (Interactive):
  bun run scripts/link-tenant.ts
  # Script will prompt for missing values
`);
  process.exit(0);
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(`${question}: `);
  const input = await new Promise<string>((resolve) => {
    const reader = Bun.stdin.stream().getReader();
    reader.read().then(({ value }) => {
      reader.releaseLock();
      resolve(new TextDecoder().decode(value).trim());
    });
  });
  return input;
}

async function main() {
  console.log(`\n🔗 Linking tenant database to project\n`);

  // Get values from args or prompt
  let slug = values.slug;
  let dbUrl = values['db-url'];
  let dbToken = values['db-token'];

  // Interactive mode if values missing
  if (!slug) {
    console.log('Project slug not provided, entering interactive mode...\n');
    slug = await prompt('Enter project slug (e.g., my-project)');
  }

  if (!dbUrl) {
    console.log('\n💡 Get your database URL from: turso db show <db-name>');
    console.log('   Format: libsql://db-name-organization.turso.io\n');
    dbUrl = await prompt('Enter Turso database URL');
  }

  if (!dbToken) {
    console.log('\n💡 Get your token from: turso db tokens create <db-name>\n');
    dbToken = await prompt('Enter Turso database token');
  }

  // Validate inputs
  if (!slug || !slug.trim()) {
    console.error('❌ Project slug is required');
    process.exit(1);
  }

  if (!dbUrl || !dbUrl.startsWith('libsql://')) {
    console.error('❌ Invalid database URL. Must start with libsql://');
    console.error('   Example: libsql://tenant-my-project-org.turso.io');
    process.exit(1);
  }

  if (!dbToken || dbToken.length < 10) {
    console.error('❌ Database token is required');
    process.exit(1);
  }

  slug = slug.trim();
  dbUrl = dbUrl.trim();
  dbToken = dbToken.trim();

  console.log(`\n📋 Summary:`);
  console.log(`   Project Slug: ${slug}`);
  console.log(`   Database URL: ${dbUrl}`);
  console.log(`   Token: ${dbToken.substring(0, 20)}...\n`);

  const confirm = await prompt('Proceed with linking? (yes/no)');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    process.exit(0);
  }

  // Step 1: Get Master DB and verify project exists
  console.log('\n1️⃣  Connecting to Master DB...');
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
      })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (projectResult.length === 0) {
      console.error(`❌ Project with slug "${slug}" not found in Master DB`);
      console.error('   Create the project first:');
      console.error('   INSERT INTO projects (name, slug, client, status) VALUES (...)');
      process.exit(1);
    }

    project = projectResult[0];
    console.log(`   ✅ Found project: ${project.name}\n`);

    // Check if already linked
    if (project.tursoDbUrl) {
      console.log('⚠️  Project already has a Turso database linked:');
      console.log(`   Current: ${project.tursoDbUrl}`);
      const overwrite = await prompt('Overwrite with new database? (yes/no)');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        process.exit(0);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error accessing Master DB:', error);
    console.error('   Check your TURSO_MASTER_DB_URL and TURSO_MASTER_DB_TOKEN in .env');
    process.exit(1);
  }

  // Step 2: Update Master DB with credentials
  console.log('2️⃣  Updating Master DB with tenant credentials...');
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
    process.exit(1);
  }

  // Step 3: Initialize schema (optional)
  if (values['init-schema']) {
    console.log('3️⃣  Initializing notes table schema...');
    try {
      await initTenantSchema(dbUrl, dbToken);
      console.log('   ✅ Notes table created\n');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error);
      console.log('   ⚠️  You can initialize later via API\n');
    }
  }

  // Success summary
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║            ✅ Tenant Database Linked Successfully!                ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  console.log(`Project:    ${project.name} (${slug})`);
  console.log(`Database:   ${dbUrl}`);
  console.log(`Token:      ${dbToken.substring(0, 30)}...\n`);
  console.log('Next Steps:');
  console.log('  • API endpoints are now ready for this project');
  console.log('  • POST /api/send-note (saves to tenant, syncs master)');
  console.log('  • GET  /api/get-notes?slug=' + slug);
  console.log('');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
