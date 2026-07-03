# Qorithm

Master algorithms systematically. Qorithm is a modern platform designed to streamline competitive programming practice with structured learning paths, topic-wise tracking, distraction-free preparation, and seamless platform integrations.

## Key Features

- **Curated Problem Sheets**: Follow structured tracks to master algorithms step-by-step.
- **Company OA Roadmaps**: Track Online Assessment (OA) roadmap progress for tech giants (Google, Amazon, Meta, Netflix, etc.) with custom company mapping.
- **Progress Dashboard**: Time-based greetings, personal statistics, connected Codeforces credentials, and daily streaks.
- **Codeforces Integration**: Link your handle inline on the dashboard to sync solve histories and verify Daily Challenges (POTD).
- **Problem Notes**: Maintain private markdown notes for any problem in learning tracks or roadmaps.
- **Professional Admin Console**: KPI-driven admin view for managing users, sheet mappings, OA roadmap details, and viewing global activity.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Database**: PostgreSQL via the `postgres` driver (`DATABASE_URL`)

## Getting Started

First, install dependencies:

```bash
npm install
```

Configure your environment variables by copying the example file:

```bash
cp .env.example .env.local
```

Initialize your database:

```bash
npm run db:push
npm run db:seed
```

`drizzle.config.ts` reads `.env.local`, uses `src/services/Database/schema/index.ts`, and defaults to a local Postgres URL if `DATABASE_URL` is absent. The checked-in `.env.example` points at a Supabase-style pooled URL as an example only; the app itself treats the database as plain PostgreSQL.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

```bash
npm run dev                         # Next.js dev server
npm run build                       # Production build
npm run start                       # Start production server
npm run lint                        # ESLint with zero warnings
npm run typecheck                   # TypeScript check
npm run format                      # Prettier write
npm run format:check                # Prettier check
npm run db:generate                 # Generate Drizzle migrations
npm run db:migrate                  # Apply Drizzle migrations
npm run db:push                     # Push schema directly
npm run db:studio                   # Open Drizzle Studio
npm run db:seed                     # Seed topics, sheet sections, CF/custom problems
npm run curriculum:build            # Build data/curriculum CSVs from external APIs
npm run curriculum:import           # Import data/curriculum into Postgres
npm run curriculum:topics:backfill  # Backfill problem-topic mappings from curriculum CSVs
```

Additional schema utility scripts live in `scripts/` for manual recovery or legacy migration paths: `apply_schema.ts`, `manual-migration.ts`, and `repair-migration-baseline.ts`.

## Project Structure

The codebase is organized into clear layered modules:

```
src/
├── app/
│   ├── (public)/   # Browse route group: /OA, /sheet, /topics
│   ├── (auth)/     # Auth routes: /sign-in, /sign-up
│   ├── (app)/      # Auth-gated routes: /dashboard, /settings
│   └── admin/      # Admin-only console: /admin/**
├── components/
│   ├── actions/    # Server actions barrel (re-exports actions)
│   ├── admin/      # Admin domain components
│   ├── dashboard/  # Dashboard page components
│   ├── leaderboard/# Leaderboard page components
│   ├── molecules/  # shadcn/radix primitives (from components/ui)
│   ├── oa/         # OA roadmap components
│   ├── shared/     # Shared reusable components
│   ├── sheet/      # Sheet details & mappings
│   ├── site/       # Site chrome (header, backgrounds)
│   ├── topics/     # Topics lists & creation
│   ├── tracking/   # Solved/tried state overlays and dialogs
│   └── users/      # Users lists components
├── constants.ts    # App-wide constants (rating defaults, API base URLs)
├── hooks/          # Custom hooks
├── providers/      # Context providers
├── services/
│   ├── Auth/       # Clerk auth guards, env validation
│   ├── Database/   # Drizzle client + schema definitions
│   └── Platforms/  # Codeforces sync adapter
├── types/          # Domain types and validation schemas
├── utils/          # Pure helpers (Tailwind, problem URL generators)
└── middleware.ts   # Clerk middleware route protection middleware
```

The `data/` directory contains generated curriculum datasets (`sections.csv`, `problems.csv`, `summary.json`) consumed by the curriculum import/backfill scripts.

For full architectural details, see [ARCH.md](./ARCH.md).
