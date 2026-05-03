/* global console, process, fetch */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SECTIONS = [
  "C++ Core Foundations",
  "STL in Practice",
  "Math Essentials for CP",
  "Implementation Basics",
  "Greedy Decisions",
  "Recursive Exploration",
  "Bitwise Toolkit",
  "Range Sum Patterns",
  "Binary Search Precision",
  "Pointer Control",
  "Sorting and Order Logic",
  "Constructive Strategies",
  "State Transition Basics (DP I)",
  "Graph Traversal Core",
  "Tree Reasoning Core",
  "DSU and Component Merging",
  "Segment Trees in Practice",
  "Number Theory Core",
  "Combinatorics and Probability",
  "String Algorithms Core",
  "Advanced DP Patterns",
  "Advanced Graph Techniques",
  "Advanced Number Theory",
  "Game Theory Essentials",
  "Mixed Checkpoint Set A",
  "Mixed Checkpoint Set B",
  "Mixed Checkpoint Set C",
  "Contest Readiness Set D",
  "Contest Readiness Set E",
  "Elite Mixed Set F",
];

const SECTION_TAGS = {
  "C++ Core Foundations": ["implementation", "math", "strings"],
  "STL in Practice": ["data structures", "sortings", "binary search", "implementation"],
  "Math Essentials for CP": ["math", "number theory", "combinatorics"],
  "Implementation Basics": ["implementation", "brute force", "strings", "constructive algorithms"],
  "Greedy Decisions": ["greedy", "sortings", "implementation"],
  "Recursive Exploration": ["dfs and similar", "dp", "brute force", "backtracking"],
  "Bitwise Toolkit": ["bitmasks", "math", "implementation"],
  "Range Sum Patterns": ["prefix sums", "implementation", "binary search"],
  "Binary Search Precision": ["binary search", "sortings", "two pointers"],
  "Pointer Control": ["two pointers", "sortings", "implementation"],
  "Sorting and Order Logic": ["sortings", "greedy", "data structures"],
  "Constructive Strategies": ["constructive algorithms", "greedy", "implementation"],
  "State Transition Basics (DP I)": ["dp"],
  "Graph Traversal Core": ["graphs", "dfs and similar", "shortest paths"],
  "Tree Reasoning Core": ["trees", "dfs and similar", "dp"],
  "DSU and Component Merging": ["dsu", "graphs", "data structures"],
  "Segment Trees in Practice": ["data structures", "segment tree", "divide and conquer"],
  "Number Theory Core": ["number theory", "math"],
  "Combinatorics and Probability": ["combinatorics", "probabilities", "math"],
  "String Algorithms Core": ["strings", "string suffix structures", "hashing"],
  "Advanced DP Patterns": ["dp", "bitmasks", "divide and conquer"],
  "Advanced Graph Techniques": ["graphs", "flows", "shortest paths", "dsu"],
  "Advanced Number Theory": ["number theory", "math", "fft"],
  "Game Theory Essentials": ["games", "dp", "math"],
  "Mixed Checkpoint Set A": ["implementation", "greedy", "dp", "graphs", "math"],
  "Mixed Checkpoint Set B": ["dp", "graphs", "data structures", "math"],
  "Mixed Checkpoint Set C": ["dp", "graphs", "number theory", "data structures"],
  "Contest Readiness Set D": ["dp", "graphs", "data structures", "constructive algorithms"],
  "Contest Readiness Set E": ["dp", "graphs", "data structures", "number theory"],
  "Elite Mixed Set F": ["dp", "graphs", "number theory", "data structures", "constructive algorithms"],
};

const AC_DAYS = new Set([5, 9, 14, 18, 22, 26, 30]);
const CHECKPOINT_DAYS = new Set([27, 31]);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[+]/g, "p")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sectionDifficultyBand(sectionNo) {
  if (sectionNo <= 4) return [800, 1450];
  if (sectionNo <= 12) return [900, 1750];
  if (sectionNo <= 20) return [1100, 2050];
  if (sectionNo <= 24) return [1350, 2250];
  if (sectionNo <= 27) return [1400, 2350];
  if (sectionNo <= 29) return [1600, 2500];
  return [1850, 2800];
}

function dayTarget(day, minR, maxR) {
  if (day <= 11) {
    const t = (day - 1) / 10;
    return Math.round(minR + t * (minR + 250 - minR));
  }
  if (day <= 22) {
    const t = (day - 12) / 10;
    return Math.round(minR + 250 + t * (maxR - 350 - (minR + 250)));
  }
  const t = (day - 23) / 8;
  return Math.round(maxR - 350 + t * (maxR - (maxR - 350)));
}

function csvEscape(v) {
  const s = String(v ?? "");
  return `"${s.replaceAll('"', '""')}"`;
}

function cfTier(rating) {
  if (!rating || Number.isNaN(rating)) return "T2";
  if (rating <= 1000) return "T1";
  if (rating <= 1300) return "T2";
  if (rating <= 1700) return "T3";
  if (rating <= 2100) return "T4";
  if (rating <= 2400) return "T5";
  return "T6";
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
}

function pickCodeforces(candidates, used, target, tags) {
  let best = null;
  let bestScore = -Infinity;
  for (const p of candidates) {
    const pid = `${p.contestId}:${p.index}`;
    if (used.has(`cf:${pid}`)) continue;
    if (!p.rating) continue;

    const ratingScore = 600 - Math.abs(p.rating - target);
    const tagHits = p.tags.filter((t) => tags.includes(t)).length;
    const tagScore = tagHits * 140;
    const score = ratingScore + tagScore;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

function pickAtCoder(candidates, used, target, sectionNo) {
  let best = null;
  let bestScore = -Infinity;
  for (const p of candidates) {
    const pid = `${p.contest_id}:${p.id}`;
    if (used.has(`ac:${pid}`)) continue;
    if (p.difficulty == null) continue;

    const ratingScore = 600 - Math.abs(p.difficulty - target);
    let contestScore = 0;
    if (sectionNo <= 12 && p.contest_id.startsWith("abc")) contestScore += 80;
    if (sectionNo >= 21 && (p.contest_id.startsWith("arc") || p.contest_id.startsWith("agc")))
      contestScore += 80;
    const score = ratingScore + contestScore;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

function isMostlyAsciiTitle(title) {
  // Keep AtCoder tasks with English/ASCII titles to avoid JP-only statement pages in the UI.
  return /^[\x20-\x7E]+$/.test(title);
}

async function main() {
  const cf = await fetchJson("https://codeforces.com/api/problemset.problems");
  if (cf.status !== "OK") throw new Error("Codeforces API returned non-OK status");

  const atProblems = await fetchJson("https://kenkoooo.com/atcoder/resources/problems.json");
  const atModels = await fetchJson("https://kenkoooo.com/atcoder/resources/problem-models.json");
  const atModelMap = new Map(Object.entries(atModels));

  const cfPool = cf.result.problems
    .filter((p) => p.contestId && p.index && p.name && p.rating)
    .map((p) => ({
      contestId: p.contestId,
      index: p.index,
      title: p.name,
      rating: p.rating,
      tags: p.tags ?? [],
    }));

  const atPool = atProblems
    .filter((p) => p.contest_id && p.id && p.title)
    .map((p) => {
      const model = atModelMap.get(p.id);
      return {
        contest_id: p.contest_id,
        id: p.id,
        title: p.title,
        difficulty: model?.difficulty ?? null,
      };
    })
    .filter(
      (p) =>
        p.difficulty != null &&
        !Number.isNaN(p.difficulty) &&
        isMostlyAsciiTitle(p.title) &&
        (p.contest_id.startsWith("abc") || p.contest_id.startsWith("arc") || p.contest_id.startsWith("agc")),
    );

  const used = new Set();
  const sectionRows = [];
  const problemRows = [];

  for (let i = 0; i < SECTIONS.length; i++) {
    const sectionNo = i + 1;
    const sectionName = SECTIONS[i];
    const sectionSlug = slugify(sectionName);
    const [minR, maxR] = sectionDifficultyBand(sectionNo);

    sectionRows.push({
      section_no: sectionNo,
      section_name: sectionName,
      section_slug: sectionSlug,
      description: `${sectionName} practice track with progression from fundamentals to advanced checkpoints.`,
      difficulty_start: minR,
      difficulty_end: maxR,
    });

    const tags = SECTION_TAGS[sectionName] ?? ["implementation", "math"];

    for (let day = 1; day <= 31; day++) {
      const target = dayTarget(day, minR, maxR);
      let row = null;

      if (AC_DAYS.has(day)) {
        const ac = pickAtCoder(atPool, used, target, sectionNo);
        if (ac) {
          const pid = `${ac.contest_id}:${ac.id}`;
          used.add(`ac:${pid}`);
          row = {
            section_no: sectionNo,
            section_slug: sectionSlug,
            day_order: day,
            platform: "atcoder",
            problem_id: pid,
            title: ac.title,
            url: `https://atcoder.jp/contests/${ac.contest_id}/tasks/${ac.id}`,
            cf_rating: "",
            atcoder_difficulty: Math.round(ac.difficulty),
            qorithm_tier: cfTier(ac.difficulty),
            tags: '["atcoder"]',
            reason: `Progressive ${sectionName.toLowerCase()} practice at day ${day}.`,
            is_checkpoint: CHECKPOINT_DAYS.has(day) ? "true" : "false",
            reuse_note: "",
          };
        }
      }

      if (!row) {
        const cfPick = pickCodeforces(cfPool, used, target, tags) ?? pickCodeforces(cfPool, used, target, []);
        if (!cfPick) throw new Error(`No Codeforces candidate for section ${sectionNo} day ${day}`);
        const pid = `${cfPick.contestId}:${cfPick.index}`;
        used.add(`cf:${pid}`);
        row = {
          section_no: sectionNo,
          section_slug: sectionSlug,
          day_order: day,
          platform: "codeforces",
          problem_id: pid,
          title: cfPick.title,
          url: `https://codeforces.com/problemset/problem/${cfPick.contestId}/${cfPick.index}`,
          cf_rating: cfPick.rating,
          atcoder_difficulty: "",
          qorithm_tier: cfTier(cfPick.rating),
          tags: JSON.stringify((cfPick.tags ?? []).slice(0, 3)),
          reason: `Progressive ${sectionName.toLowerCase()} practice at day ${day}.`,
          is_checkpoint: CHECKPOINT_DAYS.has(day) ? "true" : "false",
          reuse_note: "",
        };
      }

      problemRows.push(row);
    }
  }

  const sectionsHeader =
    "section_no,section_name,section_slug,description,difficulty_start,difficulty_end";
  const sectionsCsv = [
    sectionsHeader,
    ...sectionRows.map((r) =>
      [
        r.section_no,
        csvEscape(r.section_name),
        csvEscape(r.section_slug),
        csvEscape(r.description),
        r.difficulty_start,
        r.difficulty_end,
      ].join(","),
    ),
  ].join("\n");

  const problemsHeader =
    "section_no,section_slug,day_order,platform,problem_id,title,url,cf_rating,atcoder_difficulty,qorithm_tier,tags,reason,is_checkpoint,reuse_note";
  const problemsCsv = [
    problemsHeader,
    ...problemRows.map((r) =>
      [
        r.section_no,
        csvEscape(r.section_slug),
        r.day_order,
        csvEscape(r.platform),
        csvEscape(r.problem_id),
        csvEscape(r.title),
        csvEscape(r.url),
        r.cf_rating,
        r.atcoder_difficulty,
        csvEscape(r.qorithm_tier),
        csvEscape(r.tags),
        csvEscape(r.reason),
        r.is_checkpoint,
        csvEscape(r.reuse_note),
      ].join(","),
    ),
  ].join("\n");

  const outDir = path.join(process.cwd(), "data", "curriculum");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "sections.csv"), sectionsCsv, "utf8");
  await writeFile(path.join(outDir, "problems.csv"), problemsCsv, "utf8");

  const summary = {
    sections: sectionRows.length,
    problems: problemRows.length,
    codeforces: problemRows.filter((r) => r.platform === "codeforces").length,
    atcoder: problemRows.filter((r) => r.platform === "atcoder").length,
  };
  await writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");

  console.log("Curriculum generated:", summary);
  console.log("Output:", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
