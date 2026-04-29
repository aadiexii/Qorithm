-- Custom SQL migration file, put your code below! --
-- Enable RLS on all tables
ALTER TABLE "problems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "problem_topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sheet_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sheet_section_problems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_problem_states" ENABLE ROW LEVEL SECURITY;

-- Handle legacy auth tables if they exist
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accounts') THEN
        EXECUTE 'ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions') THEN
        EXECUTE 'ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verifications') THEN
        EXECUTE 'ALTER TABLE "verifications" ENABLE ROW LEVEL SECURITY;';
    END IF;
END $$;

-- Drop existing policies if any to make it idempotent
DROP POLICY IF EXISTS "Public problems are viewable by everyone" ON "problems";
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON "topics";
DROP POLICY IF EXISTS "Problem topics are viewable for published problems" ON "problem_topics";
DROP POLICY IF EXISTS "Published sheet sections are viewable by everyone" ON "sheet_sections";
DROP POLICY IF EXISTS "Sheet section problems viewable if both section and problem are published" ON "sheet_section_problems";

-- Create policies for public read-only data
CREATE POLICY "Public problems are viewable by everyone" 
ON "problems" FOR SELECT 
TO public 
USING (is_published = true);

CREATE POLICY "Topics are viewable by everyone" 
ON "topics" FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Problem topics are viewable for published problems" 
ON "problem_topics" FOR SELECT 
TO public 
USING (EXISTS (
    SELECT 1 FROM "problems" 
    WHERE "problems"."id" = "problem_topics"."problem_id" 
    AND "problems"."is_published" = true
));

CREATE POLICY "Published sheet sections are viewable by everyone" 
ON "sheet_sections" FOR SELECT 
TO public 
USING (is_published = true);

CREATE POLICY "Sheet section problems viewable if both section and problem are published" 
ON "sheet_section_problems" FOR SELECT 
TO public 
USING (
    EXISTS (
        SELECT 1 FROM "sheet_sections" 
        WHERE "sheet_sections"."id" = "sheet_section_problems"."section_id" 
        AND "sheet_sections"."is_published" = true
    ) AND 
    EXISTS (
        SELECT 1 FROM "problems" 
        WHERE "problems"."id" = "sheet_section_problems"."problem_id" 
        AND "problems"."is_published" = true
    )
);

-- Note: We intentionally do not create policies for users, user_problem_states, accounts, sessions, or verifications.
-- Without policies, default-deny applies to anon/authenticated roles.