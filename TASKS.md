# Qorithm Tasks

## Historical Phases (Completed)

- [x] **Phase 1**: Scaffold, DB setup, initial Problems/Topics schema, and public browsing.
- [x] **Phase 2**: User tracking state (`user_problem_states`), Codeforces sync logic foundation, and Landing V1.
- [x] **Phase 3**: Admin Dashboard setup, CSV bulk imports, and V1 Launch Hardening.
- [x] **Phase 4**: Admin Scalability & UX Polish.
  - [x] Auth Gate UX (React state popup instead of `window.confirm`).
  - [x] Dashboard Realism (removed `Math.random()` fake metrics).
  - [x] Admin Scalability (Drizzle `limit`/`offset` and `ILIKE` search for user management).
  - [x] Landing V3 implementation (Minimal Educational style).
- [x] **Phase 5**: Dashboard & Engagement Overhaul.
  - [x] Simplified `/problems` filter UI (Search + Rating presets, removed complex topic bar).
  - [x] Shared sheet-style Actions column for problem rows.
  - [x] Solved-focused dashboard progress view.
  - [x] Daily Challenge (POTD) and Streak tracking.
  - [x] Codeforces and AtCoder platform integrations via unified `PlatformConnections`.
  - [x] Admin KPI and layout upgrades (Overview, Users, Problems, Topics, Activity tabs).
- [x] **Phase 6**: Dashboard & Engagement Refinement.
  - [x] Solved-focused dashboard feed (Solved/Attempted/Bookmarked tabs) with no external catalog CTAs.
  - [x] Problem Notes system (End-to-End) with markdown support.
  - [x] Real Codeforces-Based POTD target logic, now gated by connected platform handles and backed by CF profile rating with solve-history fallback.
  - [x] Unified "Actions" column parity across `/problems`, `/sheet`, and dashboard (Solve, Note).
- [x] **Phase 7**: Scalable Repo Refactor.
  - [x] Reorganized `src/app` into route groups: `(public)`, `(auth)`, `(app)`, and flat `admin/`.
  - [x] Restructured domain-driven features pattern into a layered pattern: components/ (by role), services/ (Database, Platforms, Auth), types/, and utils/.
  - [x] Consolidated shared ActionState type in `src/types/admin.ts` and set up a server action barrel export in `src/components/actions/index.ts`.
- [x] **Phase 8**: Docs Reconciliation Pass.
  - [x] Reconciled README.md, ARCH.md, PRD.md, DEPLOY.md, TASKS.md, LEARNINGS.md, and PROMPTS.md against the new Nova9-style layered layout, Next.js 16 proxy middlewares, and updated integration paths.

## Remaining Roadmap

### [Launch-Critical]

- [ ] **Production Environment Provisioning**: Set up production PostgreSQL instance and apply initial migrations.
- [ ] **Clerk Production Setup**: Configure production redirect URLs and custom domain.
- [ ] **Seed Data Execution**: Run `npm run db:seed` and/or the curriculum import flow against production DB to populate the catalog.
- [ ] **Admin Bootstrap**: Manually execute SQL to promote the founding member to `admin`.

### [Post-Launch]

- [ ] **Leaderboard Refinement**: Add pagination, empty-state polish, and anti-gaming rules to the current weekly/all-time ranking system.
- [ ] **Postgres Full-Text Search**: Upgrade admin `ILIKE` queries to `tsvector` indices as the user base scales beyond 10,000 records.
- [ ] **Extended Platform Sync**: Add integrations for LeetCode or HackerRank.
