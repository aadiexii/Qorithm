# Qorithm Architecture

## Stack

- Next.js 16 App Router with TypeScript (compiled via Turbopack)
- Tailwind CSS with shadcn-style primitives
- PostgreSQL via Drizzle ORM and the `postgres` driver (`DATABASE_URL`)
- Clerk for Authentication (with local DB sync on initial session access)
- Zod for runtime verification and action validations

## Directory Structure

```
src/
├── app/
│   ├── (public)/         # Browse routes grouped without changing URLs
│   │   ├── sheet/        # /sheet and /sheet/[slug] — curated learning tracks
│   │   ├── OA/           # /OA and /OA/[company]/[section] — company PYQ roadmaps
│   │   └── topics/       # /topics — topic index
│   ├── (auth)/           # Clerk authentication pages
│   │   ├── sign-in/      # /sign-in
│   │   └── sign-up/      # /sign-up
│   ├── (app)/            # Auth-gated user pages (redirect to / if unauthenticated)
│   │   ├── dashboard/    # /dashboard — greeting, stats, streak, inline CF sync, POTD card
│   │   └── settings/     # /settings — platform credentials panel
│   ├── admin/            # Strict admin-only management console (flat layout)
│   │   ├── activity/     # /admin/activity — global user activity logs
│   │   ├── oa/           # /admin/oa — company / section / problem CRUD management panel
│   │   ├── sheet/        # /admin/sheet — section-to-problem sheet mappings panel
│   │   └── users/        # /admin/users — user account list and role configuration
│   ├── layout.tsx        # Root layout (ClerkProvider, SiteHeader, fonts)
│   └── page.tsx          # Landing page (/)
│
├── components/
│   ├── actions/          # Flat server actions (barrel re-exported)
│   ├── admin/            # Admin CRUD layouts & metadata tables
│   ├── dashboard/        # Dashboard stats, POTD cards, inline CF sync, and streak widgets
│   ├── leaderboard/      # Leaderboard client-side lists and scorecards
│   ├── molecules/        # shadcn/radix primitives (from components/ui)
│   ├── oa/               # OA roadmap tables, rows, notes trigger buttons
│   ├── shared/           # Shared reusable components (pagination-controls, etc.)
│   ├── sheet/            # Sheet track listings and mapping modules
│   ├── site/             # Global site chrome (header, backgrounds)
│   ├── topics/           # Topics delete and edit button wrappers
│   ├── tracking/         # Problem solving status selector overlays and notes popup dialogs
│   └── users/            # Users lists and promotion layouts
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
│   └── Platforms/        # Codeforces sync adapter (codeforces.ts)
│
├── types/                # Centralized schema models and validation interfaces
│
├── utils/                # Pure utility functions (cn helper, problem-url builders)
│
└── middleware.ts         # Next.js Clerk routing & auth protection middleware
```

## Route Groups

Route groups (folders with parentheses like `(public)`) organize routes into logical chunks **without changing URLs**:

- `(public)` — `/sheet`, `/OA`, `/topics`; does not enforce auth at the group level.
- `(auth)` — `/sign-in`, `/sign-up` (Clerk-provided authentication wrappers).
- `(app)` — `/dashboard`, `/settings` (automatically redirects to `/` if session is missing).
- `admin` — Flat route (intentionally not grouped) protected by layout and action authorization checks.

## Component & Actions Convention

This project utilizes a layered architecture that groups components by role rather than domain slices:

- **Server Actions**: All Next.js server actions are placed flat under `src/components/actions/` and re-exported via `src/components/actions/index.ts`. Action files only export function logic and do not export types to prevent Next.js server action bundler errors.
- **Domain Components**: Components consumed by pages are organized under `src/components/<domain>/` (e.g. `src/components/oa/` for OA roadmap views, `src/components/sheet/` for sheet section views).
- **Global / Shared**: Global UI primitives are under `src/components/molecules/`, and shared chrome layouts are under `src/components/site/` or `src/components/shared/`.

## Data Model

- `users`: Core local table, synced with Clerk. Includes `role` (`user` vs `admin`) and `codeforcesHandle`.
- `problems`, `topics`, `problem_topics`: The core CP catalog domain model.
- `sheet_sections`, `sheet_section_problems`: Curated Sheets module dictating algorithm learning tracks.
- `companies`, `company_sections`, `oa_problems`, `company_section_problems`: The Online Assessment roadmap data models matching tech companies to targeted roadmap sections and problems.
- `user_problem_states`, `user_oa_problem_states`: Progress tracking models associating users to problem completion outcomes. Includes `note` columns for private markdown notes.
- `challenges` (in `challenges.ts`): Engagement models including `daily_challenges`, `user_daily_challenges`, and `user_streaks`.

## Database Access

- Runtime DB access is server-side through `src/services/Database/client.ts`, which creates a Drizzle client with `postgres(env.DATABASE_URL, { prepare: false, ssl: "require" })`.
- `drizzle.config.ts` loads `.env.local`, points at `src/services/Database/schema/index.ts`, and writes generated migrations to `drizzle/`.

## Platform Integrations

- `src/services/Platforms/` defines a `PlatformAdapter` contract plus the Codeforces adapter.
- Codeforces handles are saved on the user profile either via `/settings` or inline directly on the main dashboard using the `CfConnectInline` panel.
- Sync actions fetch recent solves from Codeforces API (`user.status`), match them to catalog problems, and upsert solved status in `user_problem_states`.
- Daily Challenge assignment requires a connected Codeforces handle. The target rating queries the user's Codeforces rating via `user.info` (defaulting to 800 if unrated/fetch error) to select a challenge problem within +/- 200 rating points of the user's rating.
- Streak verification fetches Codeforces submissions in real-time (`user.status`) on clicking the "Refresh Streak" button to verify if today's POTD problem is solved.

## Security Model

- **Route Separation**: All public read operations are isolated from management actions. Management routes live strictly under `/admin/*`.
- **Server Guards**: Admin actions and layouts are strictly protected by a `requireAdmin()` server guard that performs server-side DB validation of the user's role before executing any mutation.
- **Auth-Gated Mutations**: All progress tracking actions (e.g., toggling a bookmark) verify the user's active session. Unauthenticated interactions surface a non-blocking React state auth-gate to redirect users to Clerk.
- **Middleware**: `src/middleware.ts` uses Clerk middleware to protect `/dashboard`, `/settings`, and `/admin` at the edge, which we use to protect auth-gated routes.
