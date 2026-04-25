# PM-Panel

> Project Management SaaS Platform with Multi-Tenant Database Architecture

A production-ready project management tool built for freelancers to manage multiple clients with **true data isolation** through automated database provisioning.

---

## Table of Contents

1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Development](#development)
8. [Deployment](#deployment)
9. [Usage Guide](#usage-guide)
10. [API Reference](#api-reference)
11. [Troubleshooting](#troubleshooting)

---

## Overview

PM-Panel solves the freelancer's dilemma: managing multiple clients with isolated data without juggling multiple tools.

### Key Features

- [X] Multi-tenant database architecture (auto-provisioned per project)
- [X] Single admin dashboard for all projects
- [X] Client portal with shareable links (no login required)
- [X] Real-time chat with file attachments
- [X] Dark/Light theme toggle
- [X] Edge-native deployment (low latency globally)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Astro (SSG/SSR) + Vue 3 (Interactive components) |
| Runtime | Cloudflare Workers |
| Master Database | Turso (LibSQL) |
| Tenant Databases | Turso (Auto-provisioned) |
| ORM | Drizzle ORM |
| Auth | Session-based (Cloudflare KV) |
| File Storage | Cloudflare R2 |

---

## Technical Architecture

### Multi-Tenant Database System

Unlike traditional SaaS that uses a single database with `project_id` columns, PM-Panel creates **a dedicated database for each project**:

```
Master Database (Turso)
├── users
├── projects (id, name, slug, tursoDbUrl, tursoDbToken)
└── share_tokens

Tenant Database: tenant-{project-slug}-{timestamp}
└── notes (id, content, author, attachments, timestamps)
```

**Benefits:**
- True data isolation per client
- No risk of cross-project data leakage
- Simplified schema (no project_id foreign keys)
- Easy data export per client

### Request Flow

```
User Request
    ↓
Cloudflare Worker (Astro SSR)
    ↓
├─ Static assets served from edge
└─ Dynamic requests:
   ├─ API Routes → Query Master/ Tenant DB
   └─ Pages → Render Vue components
```

### Database Provisioning Flow

```
1. POST /api/projects
2. Generate unique slug
3. Call Turso Platform API
   POST /organizations/{org}/databases
   {
     name: "tenant-{slug}-{timestamp}",
     location: "sin",
     group: "pm-panel-tenants"
   }
4. Generate auth token for new DB
5. Initialize schema (notes table)
6. Save credentials (tursoDbUrl, tursoDbToken) to Master DB
7. Return success
```

---

## Prerequisites

### Required Accounts

1. **Turso** (Database)
   - Sign up: https://turso.tech
   - Install CLI: `brew install tursodatabase/tap/turso`

2. **Cloudflare** (Hosting & Storage)
   - Sign up: https://cloudflare.com
   - Install Wrangler: `npm install -g wrangler`

3. **Bun** (Runtime)
   - Install: `curl -fsSL https://bun.sh/install | bash`

### Required Tools

```bash
# Verify installations
bun --version          # 1.0+
turso --version        # Latest
wrangler --version     # 3.0+
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd pm-panel
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Create Master Database

```bash
# Login to Turso
turso auth login

# Create master database
turso db create pm-panel-master

# Get connection URL
turso db show pm-panel-master
# Copy the "LibSQL URL" (e.g., libsql://pm-panel-master-[username].turso.io)
```

### 4. Initialize Master Schema

```bash
# Set environment variable temporarily
export TURSO_MASTER_DB_URL="libsql://pm-panel-master-[username].turso.io"

# Generate auth token
turso db tokens create pm-panel-master
# Copy the token

# Create .env file
cp .env.example .env

# Edit .env with your values
TURSO_MASTER_DB_URL=libsql://pm-panel-master-[username].turso.io
TURSO_MASTER_DB_TOKEN=your-token-here
```

### 5. Push Schema

```bash
# Generate migrations
bunx drizzle-kit generate

# Push to database
bunx drizzle-kit push
```

### 6. Setup Turso Platform API (for auto-provisioning)

```bash
# Get organization name
turso org list

# Create group for tenant databases
turso group create pm-panel-tenants

# Create API token
# Go to https://app.turso.tech and generate a Platform API token
```

---

## Environment Variables

Create `.env` file:

```env
# Master Database (Central project registry)
TURSO_MASTER_DB_URL=libsql://pm-panel-master-[username].turso.io
TURSO_MASTER_DB_TOKEN=your-master-db-token

# Turso Platform API (for tenant DB provisioning)
TURSO_PLATFORM_API_TOKEN=your-platform-api-token
TURSO_ORGANIZATION=your-organization-name
TURSO_GROUP=pm-panel-tenants
TURSO_LOCATION=sin

# Session Secret (generate: openssl rand -base64 32)
SESSION_SECRET=your-session-secret-key

# Cloudflare (for deployment)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Variable Descriptions

| Variable | Purpose | Required For |
|----------|---------|--------------|
| `TURSO_MASTER_DB_URL` | Connection URL to master database | Dev & Prod |
| `TURSO_MASTER_DB_TOKEN` | Auth token for master database | Dev & Prod |
| `TURSO_PLATFORM_API_TOKEN` | API token for creating tenant databases | Dev & Prod |
| `TURSO_ORGANIZATION` | Turso organization name | Dev & Prod |
| `TURSO_GROUP` | Database group for tenants | Dev & Prod |
| `TURSO_LOCATION` | Database region (sin, ams, etc) | Dev & Prod |
| `SESSION_SECRET` | Session encryption key | Dev & Prod |
| `CLOUDFLARE_ACCOUNT_ID` | CF account identifier | Deployment |
| `CLOUDFLARE_API_TOKEN` | CF API access token | Deployment |

---

## Database Setup

### Master Database Schema

The master database tracks projects and their tenant database credentials:

```sql
-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  share_token TEXT UNIQUE,
  turso_db_url TEXT,
  turso_db_token TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for admin auth)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Tenant Database Schema

Each tenant database has a simple notes table:

```sql
-- Notes table (per project)
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  author_role TEXT DEFAULT 'admin',
  author_name TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Database Commands

```bash
# View master database
turso db shell pm-panel-master

# List all databases
turso db list

# Show database info
turso db show pm-panel-master

# Create backup
turso db dump pm-panel-master > backup.sql
```

---

## Development

### Local Development

```bash
# Start dev server
bun run dev

# Build for production (local)
bun run build

# Preview build
bun run preview
```

### Project Structure

```
pm-panel/
├── src/
│   ├── components/vue/          # Vue 3 components
│   │   ├── ClientNotes.vue      # Client chat interface
│   │   ├── ProjectForm.vue      # Create/edit project
│   │   ├── ProjectList.vue      # Project list with status
│   │   └── Toast.vue            # Notification system
│   ├── db/
│   │   └── schema.ts            # Drizzle schema definitions
│   ├── layouts/
│   │   └── Layout.astro         # Base layout with theme
│   ├── lib/
│   │   ├── query.ts             # Database queries
│   │   ├── turso-platform.ts    # Turso API integration
│   │   └── turso-tenant.ts      # Tenant DB connection
│   ├── pages/
│   │   ├── index.astro          # Landing page
│   │   ├── login.astro          # Admin login
│   │   ├── dashboard.astro      # Admin dashboard
│   │   ├── project/[id].astro   # Project detail
│   │   └── share/[token].astro  # Client portal
│   └── pages/api/               # API routes
│       ├── auth/                # Authentication
│       ├── projects.ts          # CRUD projects
│       └── notes.ts             # CRUD notes
├── public/
│   └── screenshot/              # Documentation images
└── global-styling.css           # Consolidated styles
```

### Adding New Features

1. **New API Endpoint:**
   ```typescript
   // src/pages/api/new-feature.ts
   import type { APIRoute } from 'astro';
   
   export const GET: APIRoute = async () => {
     // Implementation
     return new Response(JSON.stringify(data));
   };
   ```

2. **New Vue Component:**
   ```vue
   <!-- src/components/vue/NewComponent.vue -->
   <script setup lang="ts">
   // Component logic
   </script>
   
   <template>
     <!-- Template -->
   </template>
   
   <style scoped>
   /* Styles */
   </style>
   ```

3. **New Database Table:**
   ```typescript
   // src/db/schema.ts
   export const newTable = sqliteTable('new_table', {
     id: integer('id').primaryKey(),
     // ... fields
   });
   ```

---

## Deployment

### Deploy to Cloudflare Workers

1. **Configure Wrangler:**
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Check account
   wrangler whoami
   ```

2. **Set Secrets:**
   ```bash
   # Add each environment variable
   wrangler secret put TURSO_MASTER_DB_URL
   wrangler secret put TURSO_MASTER_DB_TOKEN
   wrangler secret put TURSO_PLATFORM_API_TOKEN
   wrangler secret put TURSO_ORGANIZATION
   wrangler secret put TURSO_GROUP
   wrangler secret put TURSO_LOCATION
   wrangler secret put SESSION_SECRET
   ```

3. **Deploy:**
   ```bash
   # Build and deploy
   bun run deploy
   
   # Or manually
   wrangler deploy
   ```

### Post-Deployment

1. **Create Admin User:**
   ```bash
   # Use Turso CLI to add admin user
   turso db shell pm-panel-master
   
   INSERT INTO users (email, password_hash, name)
   VALUES ('admin@example.com', 'hashed-password', 'Admin');
   ```

2. **Verify Deployment:**
   - Visit `https://your-project.pages.dev`
   - Test login
   - Create a test project
   - Verify tenant database was created in Turso dashboard

### Custom Domain (Optional)

```bash
# Add custom domain
wrangler pages domain add your-domain.com
```

---

## Usage Guide

### For Admin (Freelancer)

#### 1. Login
- Navigate to `/login`
- Enter admin credentials
- Access dashboard

#### 2. Create Project
- Click "New Project"
- Enter project name, client name, description
- Select initial status (draft/review/done)
- Submit

#### 3. Manage Project
- View all projects on dashboard
- Click project to view details
- Update status using status buttons
- Use chat interface to communicate
- Generate share link for client access

#### 4. Share with Client
- Copy share link from project page
- Send to client
- Client can access without login

### For Client

#### 1. Access Portal
- Click share link or navigate to `/share/{token}`
- View project details
- See all previous communications

#### 2. Send Message
- Type message in chat box
- Optional: Attach file (images, documents)
- Click send

#### 3. View Attachments
- Click images to view in lightbox
- Download files from chat

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Get current user |

**Login Request:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects` | POST | Create new project |
| `/api/projects?project_id=1` | GET | Get project by ID |
| `/api/projects?project_id=1&status=done` | PATCH | Update status |
| `/api/projects?project_id=1` | DELETE | Delete project |

**Create Project:**
```json
POST /api/projects
{
  "name": "Website Redesign",
  "client": "Acme Corp",
  "description": "New company website",
  "status": "draft"
}
```

**Response:**
```json
{
  "id": 1,
  "slug": "website-redesign-abc123",
  "name": "Website Redesign",
  "client": "Acme Corp",
  "status": "draft",
  "share_token": "xyz789",
  "created_at": "2025-04-25T10:00:00Z"
}
```

### Notes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes?project_id=1` | GET | Get project notes |
| `/api/notes?slug=project-slug` | GET | Get notes by slug |
| `/api/notes` | POST | Create note |
| `/api/notes?id=1&slug=project-slug` | DELETE | Delete note |

**Create Note (Admin):**
```json
POST /api/notes
{
  "projectId": 1,
  "content": "Mockup approved by client",
  "authorRole": "admin",
  "authorName": "John Developer"
}
```

**Create Note (Client):**
```json
POST /api/share/notes?token=xyz789
{
  "content": "Looks great!",
  "authorRole": "client",
  "authorName": "Jane Client",
  "attachment": {
    "url": "https://.../file.pdf",
    "type": "application/pdf",
    "name": "requirements.pdf"
  }
}
```

### Share (Client Access)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/share/validate?token=xyz` | GET | Validate share token |
| `/api/share/notes?token=xyz` | GET | Get notes (client) |
| `/api/share/notes?token=xyz` | POST | Create note (client) |

---

## Troubleshooting

### Common Issues

#### 1. "TURSO_PLATFORM_API_TOKEN environment variable is required"
**Cause:** Missing API token for tenant provisioning
**Solution:**
```bash
# Generate token in Turso dashboard
# Add to .env and Wrangler secrets
wrangler secret put TURSO_PLATFORM_API_TOKEN
```

#### 2. "Project not found or invalid share token"
**Cause:** Invalid or expired share token
**Solution:**
- Regenerate share link from project page
- Check that token exists in database

#### 3. Tenant database not created on project creation
**Check logs:**
```bash
wrangler tail
```

**Common causes:**
- Invalid `TURSO_ORGANIZATION`
- Group doesn't exist: `turso group create pm-panel-tenants`
- API token doesn't have permission

#### 4. "Failed to connect to tenant database"
**Cause:** Invalid database URL or token
**Solution:**
```bash
# Check project record
turso db shell pm-panel-master
SELECT slug, turso_db_url FROM projects;

# Verify token is valid
turso db tokens validate <token>
```

#### 5. File upload fails
**Cause:** Missing R2 bucket or wrong configuration
**Solution:**
- Create R2 bucket in Cloudflare dashboard
- Add bucket binding to `wrangler.toml`

### Debug Commands

```bash
# Check environment variables
wrangler secret list

# View logs
wrangler tail

# Test database connection
bunx drizzle-kit studio

# Local debug
bun run dev --verbose
```

### Getting Help

1. Check Cloudflare Workers docs: https://developers.cloudflare.com/workers/
2. Turso documentation: https://docs.turso.tech
3. Astro docs: https://docs.astro.build
4. Open an issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

## Development Commands Cheat Sheet

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Database
bunx drizzle-kit generate    # Generate migrations
bunx drizzle-kit push        # Push schema to database
bunx drizzle-kit studio      # Open Drizzle Studio

# Deployment
wrangler deploy          # Deploy to Cloudflare
wrangler tail            # View logs
wrangler secret put KEY  # Set secret

# Turso
turso db list            # List databases
turso db shell NAME      # Open database shell
turso db tokens create   # Create auth token
```

---

## License

MIT License - See LICENSE file for details

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

**Built with [Astro](https://astro.build), [Vue](https://vuejs.org), [Turso](https://turso.tech), and [Cloudflare](https://cloudflare.com)**
