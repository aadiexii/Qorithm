# Qorithm PRD

## Product

Qorithm is a modern SaaS workspace for competitive programming preparation, providing structured study sheets, company Online Assessment (OA) roadmaps, and automated platform progress tracking.

## Current State & Goal

The platform is a clean, minimal dashboard-centric app for active tracking, featuring personalized Codeforces POTD (Problem of the Day) daily challenges and streaks. It includes curated sheets (`/sheet`), company OA roadmaps (`/OA`), and a secure administration console (`/admin`).

## Primary User

Competitive programmers and job seekers who want structured, distraction-free roadmap tracks, private problem notes, daily streak gamification, and automated sync of their solved problems.

## Core Workflows

1. **Structured Learning**: Users follow curated tracks (e.g. dynamic programming, graphs) step-by-step under `/sheet` and company OA roadmaps under `/OA` (displaying placeholders/coming soon cards where roadmaps are being curated).
2. **Auth-Gated Progress**: Signed-in users can bookmark problems, mark them as solved/attempted, and save private markdown notes. Unauthenticated clicks trigger an inline authentication modal.
3. **Codeforces Integration**: Users link their Codeforces handle directly on the main dashboard to sync their latest submissions, verify POTD completions, and increment daily streaks. POTD rating targets are dynamically computed from Codeforces ratings (with fallback algorithms if unrated).
4. **Admin content Ops**: Admins manage sheets, company roadmaps, sections, problems, CSV imports, user accounts, and track global user activity through guarded `/admin` pages.

## Current Capabilities

- Clerk-based authentication synced to a local PostgreSQL Drizzle database.
- Curated Sheet tracks (`/sheet/[slug]`) and sections with user-specific status tracking.
- Online Assessment (OA) Roadmaps (`/OA/[company]`) displaying structured company sections and problems (with placeholder "coming soon" overlays for curate-in-progress companies).
- Main Dashboard: Time-based personalized greeting ("Good morning, Shivam"), quick stats row (solved count, bookmark count, active daily streak), Codeforces account sync badge, and live Codeforces-only daily challenge (POTD).
- Live Verification: "Refresh Streak" button on the dashboard that queries live Codeforces submissions via the Codeforces API to dynamically check if the daily challenge is solved and update the user's active streak.
- Markdown problem notes accessible via actions on both the dashboard lists and sheets.
- Centralized Admin CRUD Console (`/admin`):
  - Overview panel showing key metrics (Active Users, Curated Problems, Total Sheets, Activity logs).
  - Users sheet with role configurations.
  - Sheets mapping layout.
  - OA roadmap management panel (Company, Section, and Problem CRUD).
  - Live global activity feed.
- Curriculum seeding script (`scripts/seed-oa.ts` and `npm run db:seed`) pre-populating 6 top-tier company roadmaps, 17 roadmap sections, 34 company problems, plus starter sheets and topics.

## Out Of Scope / Archived

- AtCoder integration (archived/removed from both schema and platforms service).
- Public `/problems` open catalog route (fully cleaned up and archived; user flow is strictly sheet/OA-driven).
- Collaboration, teams, and background cron jobs.
