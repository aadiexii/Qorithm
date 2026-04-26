# Qorithm Tasks

## Historical Phases (Completed)
- [x] **Phase 1**: Scaffold, DB setup, initial Problems/Topics schema, and public browsing.
- [x] **Phase 2**: User tracking state (`user_problem_states`), Codeforces sync logic foundation, and Landing V1.
- [x] **Phase 3**: Admin Dashboard setup, CSV bulk imports, and V1 Launch Hardening.
- [x] **Phase 4**: Admin Scalability & UX Polish.
  - [x] Auth Gate UX (React state popup instead of `window.confirm`).
  - [x] Dashboard Realism (removed `Math.random()` fake metrics).
  - [x] Admin Scalability (Drizzle `limit`/`offset` and `ILIKE` search for user management).
  - [x] Landing V3 implementation (Minimal Educational style, removal of AI-hype elements).

## Remaining Roadmap

### [Launch-Critical]
- [ ] **Production Environment Provisioning**: Set up production Supabase/Neon instance and apply initial migrations.
- [ ] **Clerk Production Setup**: Configure production redirect URLs and custom domain.
- [ ] **Seed Data Execution**: Run `npm run db:seed` against production DB to populate the initial catalog.
- [ ] **Admin Bootstrap**: Manually execute SQL to promote the founding member to `admin`.

### [Post-Launch]
- [ ] **Streak Tracking Logic**: Replace the stable dashboard fallback (`0`) with a robust daily commit-graph calculation from `user_problem_states`.
- [ ] **Leaderboard Implementation**: Create a global ranking system based on problem difficulty and quantity solved.
- [ ] **Codeforces OAuth**: Upgrade the settings page to handle proper OAuth handshakes rather than relying solely on handle scraping.
- [ ] **Postgres Full-Text Search**: Upgrade admin `ILIKE` queries to `tsvector` indices as the user base scales beyond 10,000 records.

