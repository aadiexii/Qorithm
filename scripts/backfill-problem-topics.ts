import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile } from "node:fs/promises";
import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { problems, topics, problemTopics } from "../src/db/schema/problems";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

// ---------------------------------------------------------------------------
// CSV parser (same approach as import-curriculum.ts — no external deps)
// ---------------------------------------------------------------------------

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
      continue;
    }

    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ",") { row.push(field); field = ""; continue; }
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    if (ch === "\r") continue;
    field += ch;
  }

  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function rowsToObjects<T extends Record<string, string>>(rows: string[][]): T[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  return data.map((r) => {
    const o: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) o[header[i]] = r[i] ?? "";
    return o as T;
  });
}

// ---------------------------------------------------------------------------
// Tag normalization
// ---------------------------------------------------------------------------

const TAG_NORMALIZATION: Record<string, string> = {
  "dp": "dynamic-programming",
  "dynamic programming": "dynamic-programming",
  "maths": "math",
  "math": "math",
  "graphs": "graph",
  "graph": "graph",
  "sortings": "sorting",
  "sorting": "sorting",
  "binary search": "binary-search",
  "data structures": "data-structures",
  "string": "strings",
  "strings": "strings",
  "two pointers": "two-pointers",
  "number theory": "number-theory",
  "bitmask": "bitmasks",
  "bitmasks": "bitmasks",
  "bit manipulation": "bitmasks",
  "combinatorics": "combinatorics",
  "divide and conquer": "divide-and-conquer",
  "dsu": "dsu",
  "greedy": "greedy",
  "implementation": "implementation",
  "constructive algorithms": "constructive-algorithms",
  "geometry": "geometry",
  "brute force": "brute-force",
  "dfs and similar": "dfs-and-similar",
  "trees": "trees",
  "shortest paths": "shortest-paths",
  "hashing": "hashing",
  "interactive": "interactive",
  "games": "games",
  "matrices": "matrices",
  "probabilities": "probabilities",
  "meet-in-the-middle": "meet-in-the-middle",
  "flows": "flows",
  "graph matchings": "graph-matchings",
  "2-sat": "2-sat",
  "fft": "fft",
  "ternary search": "ternary-search",
  "simulation": "simulation",
  "stack": "stack",
  "queue": "queue",
  "recursion": "recursion",
};

function normalizeTag(tag: string): string {
  const t = tag.trim().toLowerCase();
  return TAG_NORMALIZATION[t] ?? t.replace(/\s+/g, "-");
}

function tagSlugToName(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ---------------------------------------------------------------------------
// Platform key helpers (must mirror import-curriculum.ts encoding)
// ---------------------------------------------------------------------------

function encodeAtCoderContestId(contestId: string): number {
  const m = /^(abc|arc|agc)(\d+)$/i.exec(contestId);
  if (m) {
    const prefix = m[1].toLowerCase();
    const n = Number(m[2]);
    if (prefix === "abc") return 100000 + n;
    if (prefix === "arc") return 200000 + n;
    if (prefix === "agc") return 300000 + n;
  }
  let h = 0;
  for (const c of contestId) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return 900000 + (h % 99999);
}

type ProblemCsvRow = {
  platform: "codeforces" | "atcoder";
  problem_id: string;
  tags: string;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n📚 Qorithm — Problem Topic Backfill (batched)");
  console.log("===============================================\n");

  const csvPath = path.join(process.cwd(), "data", "curriculum", "problems.csv");
  const content = await readFile(csvPath, "utf-8");
  const rows = parseCsv(content);
  const csvRows = rowsToObjects<ProblemCsvRow>(rows);
  console.log(`CSV rows loaded: ${csvRows.length}`);

  // Load all DB problems
  const allProblems = await db
    .select({ id: problems.id, platform: problems.platform, contestId: problems.externalContestId, index: problems.externalProblemIndex })
    .from(problems);

  const problemLookup = new Map<string, string>();
  for (const p of allProblems) {
    if (p.platform && p.contestId != null && p.index) {
      problemLookup.set(`${p.platform}:${p.contestId}:${p.index}`, p.id);
    }
  }
  console.log(`DB problems loaded: ${allProblems.length}`);

  // Load existing topics
  const existingTopics = await db.select().from(topics);
  const topicSlugToId = new Map(existingTopics.map((t) => [t.slug, t.id]));
  console.log(`Existing topics: ${existingTopics.length}`);

  // Load existing problem_topics
  const existingPT = await db.select({ problemId: problemTopics.problemId, topicId: problemTopics.topicId }).from(problemTopics);
  const existingPTSet = new Set(existingPT.map((pt) => `${pt.problemId}:${pt.topicId}`));
  console.log(`Existing problem_topics rows: ${existingPT.length}\n`);

  // --- Phase 1: collect all needed slugs, create missing topics in bulk ---
  const neededSlugs = new Set<string>();

  for (const row of csvRows) {
    if (!row.tags) continue;
    let rawTags: string[];
    try { rawTags = JSON.parse(row.tags); if (!Array.isArray(rawTags)) continue; }
    catch { continue; }
    for (const t of rawTags) neededSlugs.add(normalizeTag(t));
  }

  const missingSlugs = [...neededSlugs].filter((s) => !topicSlugToId.has(s));
  let topicsCreated = 0;

  if (missingSlugs.length > 0) {
    console.log(`Creating ${missingSlugs.length} new topics...`);
    // Batch insert all missing topics at once
    const newTopics = await db
      .insert(topics)
      .values(missingSlugs.map((slug) => ({ slug, name: tagSlugToName(slug) })))
      .onConflictDoNothing()
      .returning({ id: topics.id, slug: topics.slug });
    for (const t of newTopics) {
      topicSlugToId.set(t.slug, t.id);
      topicsCreated++;
    }
  }

  // --- Phase 2: collect all (problemId, topicId) pairs to insert ---
  const toInsert: { problemId: string; topicId: string }[] = [];
  let problemsMatched = 0;
  let problemsMissed = 0;

  for (const row of csvRows) {
    if (!row.tags) continue;
    let rawTags: string[];
    try { rawTags = JSON.parse(row.tags); if (!Array.isArray(rawTags)) continue; }
    catch { continue; }

    let dbId: string | undefined;
    if (row.platform === "codeforces") {
      const [contestRaw, indexRaw] = row.problem_id.split(":");
      const contestId = Number(contestRaw);
      if (contestId && indexRaw) dbId = problemLookup.get(`codeforces:${contestId}:${indexRaw}`);
    } else if (row.platform === "atcoder") {
      const [contestId, taskId] = row.problem_id.split(":");
      if (contestId && taskId) {
        const encoded = encodeAtCoderContestId(contestId);
        dbId = problemLookup.get(`atcoder:${encoded}:${taskId}`);
      }
    }

    if (!dbId) { problemsMissed++; continue; }
    problemsMatched++;

    for (const rawTag of rawTags) {
      const slug = normalizeTag(rawTag);
      const topicId = topicSlugToId.get(slug);
      if (!topicId) continue;
      const key = `${dbId}:${topicId}`;
      if (!existingPTSet.has(key)) {
        toInsert.push({ problemId: dbId, topicId });
        existingPTSet.add(key); // prevent dupes within this run
      }
    }
  }

  console.log(`Problems matched: ${problemsMatched}, not found in DB: ${problemsMissed}`);
  console.log(`New problem_topics to insert: ${toInsert.length}`);

  // --- Phase 3: batch insert in chunks of 500 ---
  let ptAdded = 0;
  const CHUNK = 500;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    await db.insert(problemTopics).values(chunk).onConflictDoNothing();
    ptAdded += chunk.length;
    process.stdout.write(`  Inserted ${Math.min(ptAdded, toInsert.length)} / ${toInsert.length}\r`);
  }

  console.log("\n\nResults:");
  console.log(`  Problems matched in DB:         ${problemsMatched}`);
  console.log(`  Problems not found in DB:       ${problemsMissed}`);
  console.log(`  New topics created:             ${topicsCreated}`);
  console.log(`  New problem_topics rows added:  ${ptAdded}`);
  console.log(`  Total problem_topics after:     ${existingPT.length + ptAdded}`);

  console.log("\n✅ Backfill complete.\n");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
