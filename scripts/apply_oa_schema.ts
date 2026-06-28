import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  try {
    console.log("Applying manual OA schema updates...");

    // Enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE "public"."oa_difficulty" AS ENUM('easy', 'medium', 'hard');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE "public"."oa_platform" AS ENUM('leetcode', 'gfg', 'codeforces');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Tables
    await sql`
      CREATE TABLE IF NOT EXISTS "companies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "logo" text,
        "difficulty" text NOT NULL,
        "description" text,
        "is_published" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "company_sections" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "description" text,
        "is_published" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "oa_problems" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "slug" text NOT NULL,
        "difficulty" "public"."oa_difficulty" DEFAULT 'medium' NOT NULL,
        "platform" "public"."oa_platform" DEFAULT 'leetcode' NOT NULL,
        "url" text NOT NULL,
        "is_published" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "company_section_problems" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "section_id" uuid NOT NULL REFERENCES "company_sections"("id") ON DELETE cascade,
        "oa_problem_id" uuid NOT NULL REFERENCES "oa_problems"("id") ON DELETE cascade,
        "order_index" integer DEFAULT 0 NOT NULL,
        "is_required" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "user_oa_problem_states" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "oa_problem_id" uuid NOT NULL REFERENCES "oa_problems"("id") ON DELETE cascade,
        "status" "public"."problem_status" DEFAULT 'not_started' NOT NULL,
        "bookmarked" boolean DEFAULT false NOT NULL,
        "note" text,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    // Indexes
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "companies_slug_idx" ON "companies" ("slug");
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS "companies_published_idx" ON "companies" ("is_published");
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "company_sections_company_sort_idx" ON "company_sections" ("company_id", "sort_order");
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS "company_sections_published_idx" ON "company_sections" ("is_published");
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "oa_problems_published_idx" ON "oa_problems" ("is_published");
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "company_section_problems_section_problem_idx" ON "company_section_problems" ("section_id", "oa_problem_id");
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS "company_section_problems_section_order_idx" ON "company_section_problems" ("section_id", "order_index");
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "user_oa_problem_states_user_oa_idx" ON "user_oa_problem_states" ("user_id", "oa_problem_id");
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS "user_oa_problem_states_user_status_idx" ON "user_oa_problem_states" ("user_id", "status");
    `;

    console.log("OA Schema manual tables and indexes applied successfully.");
  } catch (error) {
    console.error("Error applying OA schema:", error);
  } finally {
    await sql.end();
  }
}

main();
