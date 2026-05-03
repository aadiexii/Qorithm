# Qorithm PRD

## Product
Qorithm is a SaaS workspace for organizing competitive programming problems, topics, and structured study sheets.

## Current State & Goal
The platform provides a dual-workflow environment: a `sheet-first` path for structured, curated learning tracks, and a `problems-first` path for open catalog filtering. The current goal is to provide a highly engaging user dashboard (with personalized POTD streaks and progress tracking) and a robust, analytics-driven admin console.

## Primary User
Competitive programmers who want a clean personal dashboard for tracking problems, maintaining daily streaks, and mastering algorithms across curated tracks via automated platform sync.

## Core Workflows
1. **Public Browse**: Unauthenticated users can freely browse published problems and view the structure of curated sheets.
2. **Auth-Gated Interaction**: Users must sign in to mutate state (bookmark problems, change completion status). Interactions seamlessly trigger an inline auth-gate to prevent data loss.
3. **Automated Sync & Smart Recommendations**: Users connect Codeforces to automatically sync their solved problems and unlock a personalized, rating-gated Daily Challenge (POTD). AtCoder integration is also supported for general problem tracking.
4. **Admin Content Ops**: Dedicated users with the `admin` role manage the entire catalog (problems, topics, sheet mappings, bulk CSV imports), view system KPIs, and monitor user activity exclusively from protected `/admin` routes.

## Current Capabilities
- Clerk-based authentication synced with a local Drizzle database.
- Interactive problem catalog filtered by search and rating (simplified interface).
- Dashboard focused on recent activity (Solved/Attempted/Bookmarked), and a personalized, strictly-gated Daily Challenge (POTD).
- Private Problem Notes system accessible directly from the problem catalog and dashboard.
- Automated API integrations for Codeforces and AtCoder to synchronize user problem states.
- Seamless admin interface for scalable sheet mapping, user management, and platform analytics with a KPI-first design.
- V3 Minimal Educational landing page.

## Out Of Scope / Later
- Global leaderboard features.
- Collaboration and teams.
