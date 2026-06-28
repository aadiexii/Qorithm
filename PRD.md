# Qorithm PRD

## Product

Qorithm is a SaaS workspace for organizing competitive programming problems, topics, and structured study sheets.

## Current State & Goal

The platform provides a dual-workflow environment: a `sheet-first` path for structured, curated learning tracks, and a `problems-first` path for open catalog filtering. The current goal is to provide a highly engaging user dashboard (with personalized POTD streaks and progress tracking) and a robust, analytics-driven admin console.

## Primary User

Competitive programmers who want a clean personal dashboard for tracking problems, maintaining daily streaks, and mastering algorithms across curated tracks with platform sync.

## Core Workflows

1. **Public Browse**: Unauthenticated users can freely browse published problems and view the structure of curated sheets.
2. **Auth-Gated Interaction**: Users must sign in to mutate state (bookmark problems, change completion status). Interactions seamlessly trigger an inline auth-gate to prevent data loss.
3. **Platform Sync & Smart Recommendations**: Users connect Codeforces and AtCoder from `/settings` to sync solved problems and unlock a personalized, rating-gated Daily Challenge (POTD). Codeforces profile rating drives POTD difficulty, with solve-history fallback if the profile API is unavailable.
4. **Admin Content Ops**: Dedicated users with the `admin` role manage the entire catalog (problems, topics, sheet mappings, bulk CSV imports), view system KPIs, and monitor user activity exclusively from protected `/admin` routes.

## Current Capabilities

- Clerk-based authentication synced with a local Drizzle database.
- Interactive published problem catalog filtered by search and rating.
- Public sheet browser with published learning sections, per-user progress when signed in, and ordered section detail pages.
- Dashboard focused on progress stats, activity heatmap, sync status, recent Solved/Attempted/Bookmarked tabs, streaks, and a personalized Daily Challenge (POTD).
- Private Problem Notes system accessible directly from the problem catalog and dashboard.
- `/settings` platform connections for Codeforces and AtCoder handles, with manual sync support.
- API integrations for Codeforces and AtCoder synchronize user problem states when users trigger sync.
- Auth-gated `/leaderboard` with weekly and all-time rankings derived from solved problem difficulty totals.
- Seamless admin interface for scalable sheet mapping, user management, and platform analytics with a KPI-first design.
- Curriculum dataset tooling: build from external APIs, import 30 sections / 930 problems from `data/curriculum`, and backfill problem-topic mappings.
- V3 Minimal Educational landing page with live published sheet-section previews from the database.

## Out Of Scope / Later

- Collaboration and teams.
- Fully automated background sync jobs.
