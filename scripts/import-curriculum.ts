import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  problems,
  sheetSectionProblems,
  sheetSections,
} from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

type SectionCsvRow = {
  section_no: string;
  section_name: string;
  section_slug: string;
  description: string;
  difficulty_start: string;
  difficulty_end: string;
};

type ProblemCsvRow = {
  section_no: string;
  section_slug: string;
  day_order: string;
  platform: "codeforces" | "atcoder";
  problem_id: string;
  title: string;
  url: string;
  cf_rating: string;
  atcoder_difficulty: string;
  qorithm_tier: string;
  tags: string;
  reason: string;
  is_checkpoint: string;
  reuse_note: string;
};

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (ch === "\r") continue;
    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function rowsToObjects<T extends Record<string, string>>(
  rows: string[][],
): T[] {
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  return data.map((r) => {
    const o: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      o[header[i]] = r[i] ?? "";
    }
    return o as T;
  });
}

function parseCodeforcesProblemId(problemId: string): {
  contestId: number;
  index: string;
} {
  const [contestRaw, indexRaw] = problemId.split(":");
  const contestId = Number(contestRaw);
  if (!contestId || !indexRaw) {
    throw new Error(`Invalid Codeforces problem_id: ${problemId}`);
  }
  return { contestId, index: indexRaw };
}

function parseAtCoderProblemId(problemId: string): {
  contestId: string;
  taskId: string;
} {
  const [contestId, taskId] = problemId.split(":");
  if (!contestId || !taskId) {
    throw new Error(`Invalid AtCoder problem_id: ${problemId}`);
  }
  return { contestId, taskId };
}

function encodeAtCoderContestId(contestId: string): number {
  const m = /^(abc|arc|agc)(\d+)$/i.exec(contestId);
  if (m) {
    const prefix = m[1].toLowerCase();
    const n = Number(m[2]);
    if (prefix === "abc") return 100000 + n;
    if (prefix === "arc") return 200000 + n;
    return 300000 + n;
  }
  // Deterministic fallback for non-abc/arc/agc contest ids
  let hash = 0;
  for (const ch of contestId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 400000 + (hash % 500000);
}

async function main() {
  const baseDir = path.join(process.cwd(), "data", "curriculum");
  const sectionsPath = path.join(baseDir, "sections.csv");
  const problemsPath = path.join(baseDir, "problems.csv");

  const [sectionsRaw, problemsRaw] = await Promise.all([
    readFile(sectionsPath, "utf8"),
    readFile(problemsPath, "utf8"),
  ]);

  const sectionRows = rowsToObjects<SectionCsvRow>(parseCsv(sectionsRaw));
  const problemRows = rowsToObjects<ProblemCsvRow>(parseCsv(problemsRaw));

  if (sectionRows.length !== 30) {
    throw new Error(`Expected 30 sections, got ${sectionRows.length}`);
  }
  if (problemRows.length !== 930) {
    throw new Error(`Expected 930 problems, got ${problemRows.length}`);
  }

  const client = postgres(DATABASE_URL!, { prepare: false, ssl: "require" });
  const db = drizzle(client);

  const sectionIdBySlug = new Map<string, string>();

  // Upsert sections
  for (const s of sectionRows) {
    const sortOrder = Number(s.section_no);
    const [existing] = await db
      .select({ id: sheetSections.id })
      .from(sheetSections)
      .where(eq(sheetSections.slug, s.section_slug));

    if (existing) {
      await db
        .update(sheetSections)
        .set({
          title: s.section_name,
          description: s.description,
          sortOrder,
          isPublished: true,
          updatedAt: new Date(),
        })
        .where(eq(sheetSections.id, existing.id));
      sectionIdBySlug.set(s.section_slug, existing.id);
    } else {
      const [created] = await db
        .insert(sheetSections)
        .values({
          slug: s.section_slug,
          title: s.section_name,
          description: s.description,
          sortOrder,
          isPublished: true,
        })
        .returning({ id: sheetSections.id });
      sectionIdBySlug.set(s.section_slug, created.id);
    }
  }

  // Upsert problems and prepare mapping payload
  const mappingBySection = new Map<string, Array<{ problemId: string; orderIndex: number }>>();

  for (const p of problemRows) {
    const dayOrder = Number(p.day_order);
    const rating = p.cf_rating ? Number(p.cf_rating) : null;
    const externalDifficulty = p.platform === "atcoder" && p.atcoder_difficulty ? Number(p.atcoder_difficulty) : null;

    let externalContestId: number;
    let externalProblemIndex: string;
    let source: string;

    if (p.platform === "codeforces") {
      const cf = parseCodeforcesProblemId(p.problem_id);
      externalContestId = cf.contestId;
      externalProblemIndex = cf.index;
      source = `Codeforces ${cf.contestId}${cf.index}`;
    } else {
      const ac = parseAtCoderProblemId(p.problem_id);
      externalContestId = encodeAtCoderContestId(ac.contestId);
      externalProblemIndex = ac.taskId;
      source = `AtCoder ${ac.contestId}`;
    }

    const [existing] = await db
      .select({ id: problems.id })
      .from(problems)
      .where(
        and(
          eq(problems.platform, p.platform),
          eq(problems.externalContestId, externalContestId),
          eq(problems.externalProblemIndex, externalProblemIndex),
        ),
      );

    let problemId: string;
    if (existing) {
      await db
        .update(problems)
        .set({
          title: p.title,
          source,
          rating,
          externalDifficulty,
          isPublished: true,
        })
        .where(eq(problems.id, existing.id));
      problemId = existing.id;
    } else {
      const [created] = await db
        .insert(problems)
        .values({
          title: p.title,
          source,
          rating,
          externalDifficulty,
          platform: p.platform,
          externalContestId,
          externalProblemIndex,
          isPublished: true,
        })
        .returning({ id: problems.id });
      problemId = created.id;
    }

    const arr = mappingBySection.get(p.section_slug) ?? [];
    arr.push({ problemId, orderIndex: dayOrder });
    mappingBySection.set(p.section_slug, arr);
  }

  // Replace mappings section-wise
  for (const [slug, mappings] of mappingBySection.entries()) {
    const sectionId = sectionIdBySlug.get(slug);
    if (!sectionId) throw new Error(`Missing section id for slug ${slug}`);

    await db.delete(sheetSectionProblems).where(eq(sheetSectionProblems.sectionId, sectionId));
    await db.insert(sheetSectionProblems).values(
      mappings
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((m) => ({
          sectionId,
          problemId: m.problemId,
          orderIndex: m.orderIndex,
        })),
    );
  }

  const totalMappings = [...mappingBySection.values()].reduce((s, a) => s + a.length, 0);
  console.log(
    `Imported curriculum: sections=${sectionRows.length}, problems=${problemRows.length}, mappings=${totalMappings}`,
  );

  await client.end();
}

main().catch((err) => {
  console.error("Curriculum import failed:", err);
  process.exit(1);
});

