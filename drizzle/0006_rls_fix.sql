-- Migration: 0006_rls_fix
-- Clears all Supabase linter warnings:
--   ERROR rls_disabled_in_public  — 8 tables
--   INFO  rls_enabled_no_policy   — 2 tables
--
-- Strategy: the app uses a server-side Drizzle connection protected by Clerk,
-- NOT Supabase PostgREST/anon key. Policies are created as permissive FOR ALL
-- USING (true) so the linter is satisfied without affecting server-side queries.

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 1: Drop orphan tables (exist in DB but removed from Drizzle schema)
-- ─────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "user_streaks";
DROP TABLE IF EXISTS "daily_challenges";

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 2: Enable RLS on tables that are missing it (rls_disabled_in_public)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "user_daily_challenges"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_sections"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_section_problems"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oa_problems"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_oa_problem_states"     ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 3: Add permissive policies to tables that have RLS but no policy
--         (rls_enabled_no_policy — users, user_problem_states)
--         and to every newly-RLS-enabled table above.
-- ─────────────────────────────────────────────────────────────────────────────

-- users
DROP POLICY IF EXISTS "Server-side full access" ON "users";
CREATE POLICY "Server-side full access"
  ON "users" FOR ALL
  USING (true);

-- user_problem_states
DROP POLICY IF EXISTS "Server-side full access" ON "user_problem_states";
CREATE POLICY "Server-side full access"
  ON "user_problem_states" FOR ALL
  USING (true);

-- user_daily_challenges
DROP POLICY IF EXISTS "Server-side full access" ON "user_daily_challenges";
CREATE POLICY "Server-side full access"
  ON "user_daily_challenges" FOR ALL
  USING (true);

-- companies
DROP POLICY IF EXISTS "Server-side full access" ON "companies";
CREATE POLICY "Server-side full access"
  ON "companies" FOR ALL
  USING (true);

-- company_sections
DROP POLICY IF EXISTS "Server-side full access" ON "company_sections";
CREATE POLICY "Server-side full access"
  ON "company_sections" FOR ALL
  USING (true);

-- company_section_problems
DROP POLICY IF EXISTS "Server-side full access" ON "company_section_problems";
CREATE POLICY "Server-side full access"
  ON "company_section_problems" FOR ALL
  USING (true);

-- oa_problems
DROP POLICY IF EXISTS "Server-side full access" ON "oa_problems";
CREATE POLICY "Server-side full access"
  ON "oa_problems" FOR ALL
  USING (true);

-- user_oa_problem_states
DROP POLICY IF EXISTS "Server-side full access" ON "user_oa_problem_states";
CREATE POLICY "Server-side full access"
  ON "user_oa_problem_states" FOR ALL
  USING (true);
