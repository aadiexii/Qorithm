import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require" });

async function run() {
  console.log("Running manual migration...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "sheet_sections" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "slug" text NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_published" boolean NOT NULL DEFAULT true,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "sheet_sections_slug_unique" UNIQUE("slug")
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "sheet_section_problems" (
        "section_id" uuid NOT NULL,
        "problem_id" uuid NOT NULL,
        "order_index" integer NOT NULL DEFAULT 0,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "sheet_section_problems_section_id_problem_id_pk" PRIMARY KEY("section_id","problem_id")
      );
    `;

    // Ignore duplicate constraint errors if they already exist
    try {
      await sql`ALTER TABLE "sheet_section_problems" ADD CONSTRAINT "sheet_section_problems_section_id_sheet_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sheet_sections"("id") ON DELETE cascade ON UPDATE no action;`;
    } catch { 
      // Ignore
    }

    try {
      await sql`ALTER TABLE "sheet_section_problems" ADD CONSTRAINT "sheet_section_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;`;
    } catch {
      // Ignore
    }

    try { await sql`CREATE UNIQUE INDEX "sheet_sections_slug_idx" ON "sheet_sections" USING btree ("slug");`; } catch { /* Ignore */ }
    try { await sql`CREATE INDEX "sheet_sections_published_sort_idx" ON "sheet_sections" USING btree ("is_published","sort_order");`; } catch { /* Ignore */ }
    try { await sql`CREATE UNIQUE INDEX "sheet_section_problems_section_order_idx" ON "sheet_section_problems" USING btree ("section_id","order_index");`; } catch { /* Ignore */ }
    try { await sql`CREATE INDEX "sheet_section_problems_section_id_idx" ON "sheet_section_problems" USING btree ("section_id");`; } catch { /* Ignore */ }
    try { await sql`CREATE INDEX "sheet_section_problems_problem_id_idx" ON "sheet_section_problems" USING btree ("problem_id");`; } catch { /* Ignore */ }

    console.log("Migration completed.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
