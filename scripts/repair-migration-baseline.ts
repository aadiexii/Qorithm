import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle;`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `;

  const migrations = [
    { hash: 'ec54288f8d4d2eeaaedc74b027528ef8c28be09b66562d7acb2ab4acf858e663', ts: 1776587484519 },
    { hash: 'd17f6d08552ee69f3fc7d06b5b7aedf9f511cd1a551e0e9da8c94ca0e6ddd531', ts: 1777472455179 },
    { hash: '44baa50c98c5562a007a6370f7933014754016445804f6a95d023c9c3c6dcd53', ts: 1777481400000 }
  ];

  for (const m of migrations) {
    const exists = await sql`SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${m.hash}`;
    if (exists.length === 0) {
      await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${m.hash}, ${m.ts})`;
      console.log(`Inserted migration hash: ${m.hash}`);
    } else {
      console.log(`Migration hash already exists: ${m.hash}`);
    }
  }

  const rows = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at ASC`;
  console.log("\nFinal migration history rows:");
  console.table(rows);

  await sql.end();
}

main().catch(console.error);
