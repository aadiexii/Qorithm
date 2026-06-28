# Qorithm Architecture

## Stack

- Next.js 16 App Router with TypeScript
- Tailwind CSS with shadcn-style primitives
- PostgreSQL via Drizzle ORM and the `postgres` driver (`DATABASE_URL`)
- Clerk for Authentication (with local DB sync)
- Zod for server validation

## Directory Structure

```
src/
├── app/
│   ├── (public)/         # Browse routes grouped without changing URLs
│   │   ├── problems/     # /problems — problem catalog with filters
│   │   ├── sheet/        # /sheet and /sheet/[slug] — curated learning tracks
│   │   ├── leaderboard/  # /leaderboard — global rankings page
│   │   └── topics/       # /topics — topic index
│   ├── (auth)/           # Clerk authentication pages
│   │   ├── sign-in/      # /sign-in
│   │   └── sign-up/      # /sign-up
│   ├── (app)/            # Auth-gated user pages (redirect to / if unauthenticated)
│   │   ├── dashboard/    # /dashboard — personalized progress view, POTD, streaks
│   │   └── settings/     # /settings — platform connection management
│   ├── admin/            # Strict admin-only management console (flat, guarded layout)
│   │   ├── activity/     # /admin/activity — global activity feed
│   │   ├── import/       # /admin/import — CSV bulk import
│   │   ├── problems/     # /admin/problems — problem CRUD
│   │   ├── sheet/        # /admin/sheet — section-to-problem mapping
│   │   ├── topics/       # /admin/topics — topic CRUD
│   │   └── users/        # /admin/users — user management
│   ├── layout.tsx        # Root layout (ClerkProvider, SiteHeader, fonts)
│   └── page.tsx          # Landing page (/)
│
├── components/
│   ├── actions/          # Flat server actions (barrel re-exported)
│   ├── admin/            # Admin CRUD layouts & import tables
│   ├── Common/           # Shared reusable components
│   ├── dashboard/        # Dashboard stats, heatmap, and POTD cards
│   ├── leaderboard/      # Leaderboard rankings UI
│   ├── molecules/        # shadcn/radix primitives (from components/ui)
│   ├── problems/         # Problem catalog tables and creation forms
│   ├── sheet/            # Sheet lists and section mappings
│   ├── site/             # Global site chrome (SiteHeader, DotGridBackground)
│   ├── topics/           # Topics catalog tables and creation forms
│   ├── tracking/         # Problem solving outcomes overlays
│   └── users/            # User role configuration views
│
├── constants.ts          # Centralized parameters (default rating, API bases, etc.)
│
├── hooks/                # Custom React hooks
│
├── providers/            # React Context / wrapper providers
│
├── services/             # Core Integration & Storage services
│   ├── Auth/             # Clerk-backed auth utils (auth.ts, env.ts)
│   ├── Database/         # Drizzle client (client.ts) & schemas (schema/*)
│   └── Platforms/        # Codeforces & AtCoder sync adapters
│
├── types/                # Centralized schema models and types
│
├── utils/                # Pure utility functions (cn helper, problem-url builders)
│
└── proxy.ts              # Next.js 16 Clerk routing & auth protection middleware
```

## Route Groups

Route groups (folders with parentheses like `(public)`) are a Next.js App Router convention. They organize routes into logical groups **without affecting URLs**:

- `(public)` — `/problems`, `/sheet`, `/leaderboard`, `/topics`; the group does not enforce auth by itself, and `/leaderboard` currently performs its own session redirect
- `(auth)` — `/sign-in`, `/sign-up` (Clerk-provided widgets)
- `(app)` — `/dashboard`, `/settings` (redirect to `/` if session is missing)
- `admin` — **flat route** (intentionally not grouped — has its own guarded layout)

## Component & Actions Convention

This project utilizes a layered structure that groups components by role rather than domain slices:

- **Server Actions**: All Next.js server actions are placed flat under `src/components/actions/` and re-exported via `src/components/actions/index.ts`. Action files only export function logic and do not export types to prevent Next.js server action bundler errors.
- **Domain Components**: Components consumed by pages are organized under `src/components/<domain>/` (e.g. `src/components/problems/` for problem list views and forms).
- **Global / Shared**: Global UI primitives are under `src/components/molecules/`, and shared chrome layouts are under `src/components/site/` or `src/components/Common/`.

## Data Model

- `users`: Core local table, synced with Clerk. Includes `role` (`user` vs `admin`) and platform sync timestamps.
- `problems`, `topics`, `problem_topics`: The core CP domain model.
- `sheet_sections`, `sheet_section_problems`: The Sheet module dictating curated learning tracks.
- `user_problem_states`: Progress tracking model associating users to specific problem outcomes. Includes a `note` column for Private Problem Notes.
- `challenges` (in `challenges.ts`): Engagement models including `daily_challenges`, `user_daily_challenges`, and `user_streaks`.

## Database Access

- Runtime DB access is server-side through `src/services/Database/client.ts`, which creates a Drizzle client with `postgres(env.DATABASE_URL, { prepare: false, ssl: "require" })`.
- `drizzle.config.ts` loads `.env.local`, points at `src/services/Database/schema/index.ts`, and writes generated migrations to `drizzle/`.
- The project can run against any compatible PostgreSQL database. Supabase appears only as the sample pooled URL in `.env.example`; there is no Supabase client in the app.
- Drizzle server queries are the authorization boundary. If deploying on Supabase with RLS enabled, treat direct Supabase API access as separate from the app path and keep it locked down.

## Platform Integrations

- `src/services/Platforms/` defines a `PlatformAdapter` contract plus Codeforces and AtCoder adapters.
- `/settings` saves Codeforces and AtCoder handles, then performs non-blocking validation for Codeforces profile lookup.
- Sync actions fetch recent solves from Codeforces `user.status` and the Kenkoooo AtCoder API, match them to catalog problems, and upsert `user_problem_states`.
- Daily Challenge assignment requires both platform handles. The target rating prefers the user's Codeforces profile rating, defaults to 800 for unrated users, and falls back to averaging the last 10 rated Codeforces solves if the Codeforces profile API fails.

## Security Model

- **Route Separation**: All public read operations are isolated from management actions. Management routes live strictly under `/admin/*`.
- **Server Guards**: Admin actions and layouts are strictly protected by a `requireAdmin()` server guard that performs server-side DB validation of the user's role before executing any mutation.
- **Auth-Gated Mutations**: All progress tracking actions (e.g., toggling a bookmark) verify the user's active session. Unauthenticated interactions surface a non-blocking React state auth-gate to redirect users to Clerk.
- **Middleware / Proxy**: `src/proxy.ts` uses Clerk middleware to protect `/dashboard`, `/settings`, and `/admin` at the edge. In Next.js 16, the standard convention is `proxy.ts` (deprecating the older `middleware.ts` file convention), which we use to protect auth-gated routes.
