import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Applying manual schema updates...");

    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "codeforces_last_sync_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "atcoder_last_sync_at" timestamp with time zone;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE "public"."daily_challenge_status" AS ENUM('pending', 'completed', 'skipped');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "daily_challenges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "date" date NOT NULL UNIQUE,
        "problem_id" uuid NOT NULL REFERENCES "problems"("id") ON DELETE cascade,
        "target_rating" integer NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "user_daily_challenges" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "date" date NOT NULL,
        "problem_id" uuid NOT NULL REFERENCES "problems"("id") ON DELETE cascade,
        "status" "public"."daily_challenge_status" DEFAULT 'pending' NOT NULL,
        "completed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    await sql`
      ALTER TABLE "user_daily_challenges"
      ADD COLUMN IF NOT EXISTS "target_rating" integer,
      ADD COLUMN IF NOT EXISTS "basis" text;
    `;

    await sql`
      ALTER TABLE "user_problem_states"
      ADD COLUMN IF NOT EXISTS "note" text;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "user_streaks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE cascade,
        "current_streak" integer DEFAULT 0 NOT NULL,
        "longest_streak" integer DEFAULT 0 NOT NULL,
        "last_active_date" date,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    console.log("Schema applied successfully.");
  } catch (error) {
    console.error("Error applying schema:", error);
  } finally {
    await sql.end();
  }
}

main();
