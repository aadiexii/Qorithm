# Qorithm — Deployment Guide

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase, Neon, etc.) | `postgresql://user:pass@host:5432/cp_sheets` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `sk_test_...` |

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

### 4. Seed starter data (optional but recommended)
```bash
npm run db:seed
```

This seeds:
- 15 topics (arrays, DP, graphs, etc.)
- 25 Codeforces problems (real contest IDs for sync demo)
- 75+ custom problems (LeetCode-style)
- All problems are published and ready to browse. The script is idempotent.

### 5. Bootstrap first admin user

Authentication is managed via Clerk, but authorization is managed via the local DB. 
After creating an account via the Clerk UI:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

This updates the local synchronized user record and grants access to `/admin` routes. There is no self-service admin promotion.

### 6. Run development server
```bash
npm run dev
```

### 7. Production build
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

> **Security Note:** RLS must remain enabled for all public tables. The application relies on server-side Drizzle bypassing RLS, but direct Supabase API access must remain securely locked to read-only published catalog data.

## Architecture Overview

```
src/
├── app/
│   ├── (public)/     # Publicly accessible routes (problems, sheet)
│   ├── admin/        # Strict Admin dashboard (requireAdmin guard)
│   ├── dashboard/    # Auth-gated user progress dashboard
│   ├── settings/     # Auth-gated CF handle config
│   └── api/          # Route handlers (webhooks)
├── components/       # Shared UI
├── db/schema/        # Drizzle schemas
└── features/         # Domain-driven feature slicing
```

## Verification Checklist

Before announcing a launch, verify the following:
1. **Public Reads**: Navigate to `/problems` in an incognito window. Ensure published problems load.
2. **Auth-Gated Interactions**: Attempt to click the bookmark star on a problem while signed out. Ensure the inline React state auth-gate popup appears to redirect you to Clerk.
3. **Protected Routes**: Attempt to navigate directly to `/dashboard` while signed out. Ensure you are redirected away.
4. **Admin Promotions**: Sign in with a standard account, attempt to visit `/admin`. Ensure you are rejected. Upgrade your role in SQL, refresh, and verify the admin layout mounts.

