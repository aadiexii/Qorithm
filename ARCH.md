# Qorithm Architecture

## Stack
- Next.js 15 App Router with TypeScript
- Tailwind CSS with shadcn-style primitives
- Supabase Postgres via Drizzle ORM
- Clerk for Authentication (with local DB sync)
- Zod for server validation

## Structure
- `src/app/(public)`: Publicly accessible browse routes (`/problems`, `/sheet`).
- `src/app/admin`: Strict admin-only management routes.
- `src/components`: Shared UI, layout elements, and dot-grid backgrounds.
- `src/features`: Domain-driven feature slicing (UI, data, server actions).
- `src/db/schema`: Drizzle schema definitions.

## Data Model
- `users`: Core local table, synced with Clerk. Includes `role` (`user` vs `admin`).
- `problems`, `topics`, `problem_topics`: The core CP domain model.
- `sheet_sections`, `sheet_section_problems`: The Sheet module dictating curated learning tracks.
- `user_problem_states`: Progress tracking model associating users to specific problem outcomes.

## Security Model
- **Route Separation**: All public read operations are isolated from management actions. Management routes live strictly under `/admin/*`.
- **Server Guards**: Admin actions and layouts are strictly protected by a `requireAdmin()` server guard that performs server-side DB validation of the user's role before executing any mutation.
- **Auth-Gated Mutations**: All progress tracking actions (e.g., toggling a bookmark) verify the user's active session. Unauthenticated interactions surface a non-blocking React state auth-gate to redirect users to Clerk.

