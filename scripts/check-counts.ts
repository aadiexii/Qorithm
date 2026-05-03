import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });
  
  const sections = await sql`SELECT count(*) FROM sheet_sections`;
  console.log('Total sections:', sections[0].count);

  const mappings = await sql`SELECT count(*) FROM sheet_section_problems`;
  console.log('Total mappings:', mappings[0].count);

  const emptySections = await sql`
    SELECT s.slug 
    FROM sheet_sections s 
    LEFT JOIN sheet_section_problems m ON s.id = m.section_id 
    WHERE m.section_id IS NULL
  `;
  console.log('Empty sections count:', emptySections.length);

  const published = await sql`SELECT count(*) FROM sheet_sections WHERE is_published = true`;
  console.log('Published sections count:', published[0].count);

  await sql.end();
}

main().catch(console.error);
