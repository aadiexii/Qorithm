# Qorithm Learnings

## 2026-04-18
- The starter scaffold uses `users` as both the app-facing profile table and the Better Auth user model to avoid duplicate user records.
- Supabase is treated as managed Postgres, so the app connects through `DATABASE_URL` with Drizzle and `postgres`.
- Protected pages perform server-side session checks instead of relying on client-only guards.

## Sprint 1A
- Implemented `useActionState` from React 19 / Next.js 15 for managing form state without heavy client libraries.
- Decided to seed basic topics using standard Drizzle inserts if the `/problems` page detects no topics, rather than building a separate full topic-management UI up front.
- Refactored `eslint` configuration to flat format natively handling Next.js files to avoid legacy plugin JSON circular reference issues.

## Sprint 1B
- Server-side pagination uses Drizzle `limit`/`offset` with a separate `count()` query for the total, avoiding loading all rows into memory.
- Topic filtering requires a two-pass approach: first query matching problemIds from the `problem_topics` join table, then use `inArray` to filter the main problems query.
- URL search params (`useSearchParams`) are the single source of truth for filters and page state, making the page bookmarkable and shareable.
- Inline editing via a `useState` toggle on `editingId` keeps the UI simple without needing a modal or separate route.
- `updateProblemAction` replaces topic mappings transactionally (delete all → re-insert) to avoid complex diff logic.

## Sprint 1C
- `LEFT JOIN` with `GROUP BY` and `count(problemTopics.problemId)` gives per-topic usage counts in a single query, no N+1.
- Unique constraint violations from Postgres surface as error messages containing "unique" or "duplicate" — catching these lets us show user-friendly slug-conflict feedback without an extra existence check query.
- The auth panel benefits from three UX additions: (1) a dedicated `successMessage` state shown as a green banner before redirect, (2) `disabled` on all inputs during `isPending` to prevent double-submission, (3) clearing both error and success messages when switching between sign-in and sign-up modes.
- Topic deletion with FK cascade on `problem_topics` removes the tag association but preserves the problem rows — this is the correct behavior since problems exist independently of topics.

## Sprint 2A
- Drizzle `onConflictDoUpdate` with a composite unique target (`[userId, problemId]`) enables clean upsert semantics for tracking state — no need for separate existence checks.
- The `problemStatusEnum` pgEnum maps directly to TypeScript union types, keeping validation simple with `z.enum(["not_started", "tried", "solved"])`.
- Batch state lookups via `getUserProblemStateMap(problemIds[])` avoid N+1 queries — a single `SELECT … WHERE userId = ? AND problemId IN (…)` returns all states for the visible page.
- The dotted grid background uses pure CSS `radial-gradient` for the dot pattern (no canvas) and a second gradient layer with CSS custom properties (`--mx`, `--my`) for the spotlight, updated via `requestAnimationFrame` for smooth 60fps tracking.
- `prefers-reduced-motion: reduce` is checked at mount time to skip the pointer listener registration entirely, ensuring accessibility compliance with zero runtime cost.

## Sprint 2B
- Adding a nullable column (`codeforcesHandle`) to the existing `users` table is the least disruptive approach — Better Auth ignores unknown columns, and existing queries are unaffected since the field is optional.
- The CF API `user.status` endpoint returns all submissions (up to 10k). Deduplicating by `(contestId, index)` and keeping the earliest solve timestamp gives accurate first-solve tracking.
- A partial unique index (`WHERE platform != 'custom'`) on `(platform, externalContestId, externalProblemIndex)` prevents duplicate external problem entries while allowing unlimited custom problems with null external fields.
- The sync preserves existing `bookmarked` flags by reading the current state before upserting — if a user bookmarked a problem manually before syncing, the bookmark survives the sync.
- CF API error handling covers three layers: (1) network failures via try/catch on fetch, (2) non-OK HTTP status codes, (3) CF API-level errors where `status !== "OK"` with the `comment` field providing user-actionable messages.

## Sprint 3A
- The `requireAdmin()` guard uses a dynamic import for `eq` and `users` to avoid circular dependencies with the auth module — since `server/auth.ts` already imports `@/db/schema`, a static import of individual schema tables would create a cycle.
- The admin layout (`/admin/layout.tsx`) acts as a single protection boundary — any nested page is guaranteed admin-only without repeating the check in each page component.
- Bulk CSV import validates rows individually via Zod and collects per-row errors, but inserts all valid rows transactionally — if the DB transaction fails, zero rows are inserted to maintain consistency.
- Topic slug resolution during import uses a pre-fetched `Map<slug, id>` to avoid N+1 queries — one upfront query for all slugs, then O(1) lookups per row.
- The `isPublished` flag defaults to `false`, making content creation a two-step workflow: create → review → publish. This prevents accidental exposure of incomplete problems to end users.

## Sprint 3B
- The `isPublished` filter is added as the first WHERE condition in `queryProblems()`, ensuring it's always applied to the public catalog regardless of other filter combinations.
- Next.js `loading.tsx` convention provides automatic Suspense boundaries per route segment — no manual `<Suspense>` wrappers needed in page components.
- The `Skeleton` component uses `animate-pulse` with `bg-muted` which adapts to the app's color scheme automatically, keeping skeletons visually consistent.
- The mobile nav uses `position: absolute` anchored to the header's bottom edge, avoiding layout shift when the drawer opens — the main content doesn't reflow.
- The seed script uses per-row existence checks rather than `ON CONFLICT` to keep the insert logic simple and compatible with the topic-linking step that follows each problem insert.
- Error boundaries in Next.js App Router must be client components (`"use client"`) — the `reset()` callback triggers a re-render of the error boundary's children, effectively retrying the failed server component render.

## Phase 4
- **Strict Admin Routing**: Centralizing all management pages and mutation actions under a single `/admin/*` route group ensures security by default. It prevents accidental exposure of mutation controls on public browse tables.
- **Inline Auth-Gates**: Using a React state-driven inline auth popup (like a `Dialog` or tailored component) instead of the blocking `window.confirm` drastically improves the professional feel of the app when intercepting unauthenticated interactions on public pages.
- **Dashboard Determinism**: Deriving progress metrics via explicit SQL aggregations (e.g., `COUNT(*)`) provides deterministic, trustworthy dashboards. Using fallback fake data (`Math.random()`) destroys user trust and should be entirely purged before production.
- **Scalable Admin Tables**: For admin lists (like Users), combining Drizzle's `LIMIT`/`OFFSET` for pagination with `ILIKE` for debounced text search keeps the page lightning-fast without loading thousands of records into memory.
- **Landing Minimalism**: High-converting educational products benefit from disciplined, compact typography and precise micro-interactions (like canvas mouse-repel) rather than overwhelming, generic "AI-generated" CSS 3D visuals.

