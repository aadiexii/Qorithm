# Qorithm — Deployment Guide

## Required Environment Variables

| Variable                            | Description                  | Example                                      |
| ----------------------------------- | ---------------------------- | -------------------------------------------- |
| `DATABASE_URL`                      | PostgreSQL connection string | `postgresql://user:pass@host:5432/cp_sheets` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key        | `pk_test_...`                                |
| `CLERK_SECRET_KEY`                  | Clerk Secret Key             | `sk_test_...`                                |

## Setup Flow

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your database and Clerk keys
```

### 3. Push schema to database

```bash
npm run db:push
```

`drizzle.config.ts` loads `.env.local`, uses `src/services/Database/schema/index.ts`, and connects via `DATABASE_URL`.

### 4. Seed starter data (idempotent, optional)

To seed CP topics, sheet sections, and Codeforces/custom problems:

```bash
npm run db:seed
```

To seed OA (Online Assessment) company roadmaps, sections, and problems:

```bash
npx tsx scripts/seed-oa.ts
```

### 5. Import curriculum dataset (optional, recommended for full catalog)

```bash
npm run curriculum:build
npm run curriculum:import
npm run curriculum:topics:backfill
```

This flow builds `data/curriculum/sections.csv` and `data/curriculum/problems.csv` from Codeforces and AtCoder sources, imports the curriculum tracks, then backfills `problem_topics` mappings from curriculum tags. If the CSVs are already checked in, start at `curriculum:import`.

### 6. Bootstrap first admin user

Authentication is managed via Clerk, but authorization is managed via the local DB.
After creating an account via the Clerk UI:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

This updates the local synchronized user record and grants access to `/admin` routes. There is no self-service admin promotion.

`src/services/Auth/auth.ts` also auto-promotes emails listed in its `ADMIN_EMAILS` constant when those users sign in.

### 7. Run development server

```bash
npm run dev
```

### 8. Production build

```bash
npm run build
npm start
```

## Database Migrations

For schema changes:

```bash
npm run db:generate    # Generate migration SQL
npm run db:migrate     # Apply migrations
# OR
npm run db:push        # Push schema directly (dev/staging)
```

Manual recovery utilities:

- `scripts/apply_schema.ts` applies later dashboard/challenge/note columns and tables with raw SQL.
- `scripts/manual-migration.ts` creates sheet section tables and indexes for legacy databases.
- `scripts/repair-migration-baseline.ts` repairs the Drizzle migration history table when a database was manually bootstrapped.

Use those scripts only when reconciling an existing database that cannot cleanly run Drizzle migrations.

> **Security Note:** The application does not use browser-side database access. Authorization is enforced in server code through Clerk session checks, `requireAdmin()`, and Drizzle queries. If the backing Postgres provider is Supabase and RLS is enabled, keep direct Supabase API access locked down separately; server-side Drizzle is the intended app access path.

## Architecture Overview

```
src/
├── app/
│   ├── (public)/   # Browse route group (/OA, /sheet, /topics)
│   ├── (auth)/     # Clerk auth pages (/sign-in, /sign-up)
│   ├── (app)/      # Auth-gated user pages (/dashboard, /settings)
│   └── admin/      # Strict Admin dashboard (KPIs, Users, Content Mappings, OA Console)
├── components/
│   ├── actions/    # Server actions barrel (re-exports actions)
│   ├── admin/      # Admin page sub-components
│   ├── dashboard/  # Dashboard page components (streak buttons, inline CF connects)
│   ├── leaderboard/# Leaderboard page components
│   ├── molecules/  # shadcn/radix primitives (from components/ui)
│   ├── oa/         # OA roadmap page components
│   ├── shared/     # Shared reusable components (pagination)
│   ├── sheet/      # Sheet details & mappings
│   ├── site/       # Site chrome (header, backgrounds)
│   ├── topics/     # Topics edit and delete actions
│   ├── tracking/   # Solved/tried state overlays and notes dialogs
│   └── users/      # Users lists components
├── constants.ts    # Centralized parameters (default rating, API bases, etc.)
├── hooks/          # Custom React hooks
├── providers/      # React Context / wrapper providers
├── services/       # Core Integration & Storage services
│   ├── Auth/       # Clerk-backed auth utils (auth.ts, env.ts)
│   ├── Database/   # Drizzle client (client.ts) & schemas (schema/*)
│   └── Platforms/  # Codeforces sync adapter (codeforces.ts)
├── types/          # Centralized schema models and validation interfaces
├── utils/          # Pure utility functions (cn helper, problem-url builders)
└── middleware.ts   # Next.js Clerk routing & auth protection middleware proxy
```

`src/middleware.ts` uses the Next.js Clerk middleware for route protection.

## Platform Integrations

Qorithm uses a service adapter to sync external solves.

- **Codeforces**: Utilizes the official Codeforces API (`/user.info`, `/user.status`).
  Users link their handles via the main dashboard or `/settings`, then use the sync actions to import matched solves into their dashboard and streak state.

## Script Reference

- `scripts/seed.ts`: seeds starter topics, sheet sections, Codeforces problems, and custom problems.
- `scripts/seed-oa.ts`: seeds 6 top-tier company roadmaps, 17 roadmap sections, and 34 verified OA problems.
- `scripts/build-qorithm-curriculum.mjs`: builds curriculum CSV/summary files in `data/curriculum/` from Codeforces and AtCoder APIs.
- `scripts/import-curriculum.ts`: imports built curriculum sections/problems and section mappings into Postgres.
- `scripts/backfill-problem-topics.ts`: creates missing topics and backfills `problem_topics` mappings from curriculum tags.
- `scripts/check-counts.ts`: utility for checking table counts.
- `scripts/apply_schema.ts`, `scripts/manual-migration.ts`, `scripts/repair-migration-baseline.ts`: manual schema/migration recovery utilities.

## Verification Checklist

Before announcing a launch, verify the following:

1. **Public Reads**: Navigate to `/sheet` and `/OA` in an incognito window. Ensure tracks and companies load, displaying "Coming Soon" states properly.
2. **Auth-Gated Interactions**: Attempt to click the bookmark star or solve checkmark on a problem while signed out. Ensure the inline React state auth-gate popup appears to redirect you to Clerk.
3. **Protected Routes**: Attempt to navigate directly to `/dashboard` while signed out. Ensure you are redirected away.
4. **Admin Promotions**: Sign in with a standard account, attempt to visit `/admin`. Ensure you are rejected. Upgrade your role in SQL, refresh, and verify the admin KPI dashboard mounts.
