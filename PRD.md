# Qorithm PRD

## Product
Qorithm is a SaaS workspace for organizing competitive programming problems, topics, and structured study sheets.

## Current State & Goal
The platform provides a dual-workflow environment: a `sheet-first` path for structured, curated learning tracks, and a `problems-first` path for open catalog filtering. The current goal is to refine the public-read UX and harden the admin-only content operations model.

## Primary User
Competitive programmers who want a clean personal dashboard for tracking problems and algorithm mastery across curated tracks.

## Core Workflows
1. **Public Browse**: Unauthenticated users can freely browse published problems and view the structure of curated sheets.
2. **Auth-Gated Interaction**: Users must sign in to mutate state (bookmark problems, change completion status). Interactions seamlessly trigger an inline auth-gate to prevent data loss.
3. **Admin Content Ops**: Dedicated users with the `admin` role manage the entire catalog (problems, topics, sheet mappings, bulk CSV imports) exclusively from protected `/admin` routes.

## Current Capabilities
- Clerk-based authentication synced with a local Drizzle database.
- Interactive problem catalog with multi-dimensional filtering (topic, rating, platform).
- Real-time progress tracking and deterministic dashboard metrics.
- Seamless admin interface for scalable sheet mapping and user management (with pagination and server-side search).
- V3 Minimal Educational landing page.

## Out Of Scope / Later
- Algorithmic streak generation (currently returning stable fallbacks).
- Global leaderboard features.
- Deep Codeforces OAuth integration.
- Collaboration and teams.

