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
    console.log("Seeding OA Companies, Sections, and Problems...\n");

    // ── 1. Companies (slug is UNIQUE in schema) ───────────────────────────────
    const insertedCompanies = await sql`
      INSERT INTO "companies" ("slug", "name", "logo", "difficulty", "description")
      VALUES
        ('google',    'Google',    NULL, 'Hard',   'Curated Google coding round PYQ roadmaps focusing on advanced graph techniques, trees, and dynamic programming.'),
        ('meta',      'Meta',      NULL, 'Medium', 'Curated Meta coding round PYQs focusing on high-frequency arrays, strings, binary search, and sliding window.'),
        ('amazon',    'Amazon',    NULL, 'Medium', 'Curated Amazon coding round PYQs covering heaps, priority queues, binary search, stacks, and queues.'),
        ('microsoft', 'Microsoft', NULL, 'Medium', 'Curated Microsoft coding round PYQs covering arrays, sorting, trees, BST, and object-oriented design.'),
        ('netflix',   'Netflix',   NULL, 'Hard',   'Netflix focuses on system design fundamentals, concurrency, and threading problems.'),
        ('apple',     'Apple',     NULL, 'Medium', 'Apple interview rounds emphasise string manipulation, dynamic programming, and OS-level concepts.')
      ON CONFLICT ("slug") DO UPDATE
      SET
        "name"        = EXCLUDED."name",
        "logo"        = EXCLUDED."logo",
        "difficulty"  = EXCLUDED."difficulty",
        "description" = EXCLUDED."description"
      RETURNING "id", "slug";
    `;

    const co = new Map<string, string>(
      insertedCompanies.map((c) => [c.slug, c.id]),
    );
    console.log(`  ✓ Companies: ${insertedCompanies.map((c) => c.slug).join(", ")}`);

    // ── 2. Helper: get-or-insert a section (no unique constraint exists) ──────
    async function getOrInsertSection(
      companyId: string,
      name: string,
      slug: string,
      sortOrder: number,
      description: string,
    ): Promise<string> {
      // Check if already exists
      const [existing] = await sql`
        SELECT "id" FROM "company_sections"
        WHERE "company_id" = ${companyId} AND "slug" = ${slug}
        LIMIT 1
      `;
      if (existing) {
        // Update metadata in case it changed
        await sql`
          UPDATE "company_sections"
          SET "name" = ${name}, "sort_order" = ${sortOrder}, "description" = ${description}
          WHERE "id" = ${existing.id}
        `;
        return existing.id;
      }
      const [row] = await sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${companyId}, ${name}, ${slug}, ${sortOrder}, ${description})
        RETURNING "id"
      `;
      return row.id;
    }

    // ── 3. Helper: get-or-insert a problem + map it to a section ─────────────
    async function upsertProblem(
      sectionId: string,
      order: number,
      isRequired: boolean,
      title: string,
      slug: string,
      difficulty: string,
      url: string,
    ) {
      // Check if problem slug exists
      const [existingProb] = await sql`
        SELECT "id" FROM "oa_problems" WHERE "slug" = ${slug} LIMIT 1
      `;
      let probId: string;
      if (existingProb) {
        await sql`
          UPDATE "oa_problems"
          SET "title" = ${title}, "difficulty" = ${difficulty}, "url" = ${url}
          WHERE "id" = ${existingProb.id}
        `;
        probId = existingProb.id;
      } else {
        const [prob] = await sql`
          INSERT INTO "oa_problems" ("title", "slug", "difficulty", "platform", "url")
          VALUES (${title}, ${slug}, ${difficulty}, 'leetcode', ${url})
          RETURNING "id"
        `;
        probId = prob.id;
      }

      // company_section_problems has a unique index on (section_id, oa_problem_id)
      await sql`
        INSERT INTO "company_section_problems" ("section_id", "oa_problem_id", "order_index", "is_required")
        VALUES (${sectionId}, ${probId}, ${order}, ${isRequired})
        ON CONFLICT ("section_id", "oa_problem_id") DO UPDATE
        SET "order_index" = EXCLUDED."order_index", "is_required" = EXCLUDED."is_required"
      `;
    }

    // ── 4. Sections ───────────────────────────────────────────────────────────

    const gGraphs     = await getOrInsertSection(co.get("google")!,    "Graphs & Trees",            "graphs-and-trees",           1, "Standard graph traversals (DFS/BFS), union-find, topological sort, and tree algorithms.");
    const gDP         = await getOrInsertSection(co.get("google")!,    "Dynamic Programming",       "dp",                         2, "Curated DP tasks covering knapsack, range query DP, and state optimisation.");
    const gMath       = await getOrInsertSection(co.get("google")!,    "Math & Logic",              "math-and-logic",             3, "Number theory, bit manipulation, and brain-teaser style mathematical reasoning.");

    const mArrays     = await getOrInsertSection(co.get("meta")!,      "Arrays & Strings",          "arrays-and-strings",         1, "Two pointers, prefix sum, hash maps, and sliding window on arrays/strings.");
    const mSearch     = await getOrInsertSection(co.get("meta")!,      "Binary Search & Window",    "binary-search-and-window",   2, "Searching range patterns and dynamic size sliding windows.");
    const mBacktrack  = await getOrInsertSection(co.get("meta")!,      "Recursion & Backtracking",  "recursion-and-backtracking", 3, "Permutations, combinations, N-Queens, and constraint-satisfaction recursion.");

    const aHeaps      = await getOrInsertSection(co.get("amazon")!,    "Heaps & Priority Queues",   "heaps",                      1, "K-way merge problems, running median, and dynamic top-K tracking.");
    const aStacks     = await getOrInsertSection(co.get("amazon")!,    "Linked Lists & Stacks",     "lists-and-stacks",           2, "Monotonic stack patterns and dynamic list pointers.");
    const aGreedy     = await getOrInsertSection(co.get("amazon")!,    "Greedy & Intervals",        "greedy-and-intervals",       3, "Activity selection, interval merging, and greedy scheduling problems.");

    const msArrays    = await getOrInsertSection(co.get("microsoft")!, "Arrays & Sorting",          "arrays-and-sorting",         1, "Sorting-based problems, two-pointer, and prefix-sum patterns.");
    const msTrees     = await getOrInsertSection(co.get("microsoft")!, "Trees & BST",               "trees-and-bst",              2, "Binary trees, BST operations, and path-related tree algorithms.");
    const msDesign    = await getOrInsertSection(co.get("microsoft")!, "Object-Oriented Design",    "ood",                        3, "Class design, SOLID principles, and typical OOD interview questions.");

    const nxSystem    = await getOrInsertSection(co.get("netflix")!,   "System Design Basics",      "system-design",              1, "Scalable system architecture, caching, databases, and distributed systems fundamentals.");
    const nxConc      = await getOrInsertSection(co.get("netflix")!,   "Concurrency & Threading",   "concurrency",                2, "Thread safety, locks, semaphores, and producer-consumer patterns.");

    const apStrings   = await getOrInsertSection(co.get("apple")!,     "String Manipulation",       "string-manipulation",        1, "Anagrams, palindromes, substring search, and string transformation.");
    const apDP        = await getOrInsertSection(co.get("apple")!,     "Dynamic Programming",       "dp",                        2, "Classic DP: coin change, LCS, house robber, and partition problems.");

    console.log("  ✓ Sections ready");

    // ── 5. Problems ───────────────────────────────────────────────────────────

    // Google — Graphs & Trees
    await upsertProblem(gGraphs, 1, true,  "Evaluate Division",              "evaluate-division",                       "medium", "https://leetcode.com/problems/evaluate-division/");
    await upsertProblem(gGraphs, 2, false, "Cracking the Safe",              "cracking-the-safe",                       "hard",   "https://leetcode.com/problems/cracking-the-safe/");
    // Google — Dynamic Programming
    await upsertProblem(gDP,     1, true,  "Edit Distance",                  "edit-distance",                           "hard",   "https://leetcode.com/problems/edit-distance/");
    await upsertProblem(gDP,     2, true,  "Longest Increasing Subsequence", "longest-increasing-subsequence",          "medium", "https://leetcode.com/problems/longest-increasing-subsequence/");
    // Google — Math & Logic
    await upsertProblem(gMath,   1, true,  "Pow(x, n)",                      "powx-n",                                  "medium", "https://leetcode.com/problems/powx-n/");
    await upsertProblem(gMath,   2, false, "Count Primes",                   "count-primes",                            "medium", "https://leetcode.com/problems/count-primes/");

    // Meta — Arrays & Strings
    await upsertProblem(mArrays,   1, true,  "Subarray Sum Equals K",            "subarray-sum-equals-k",                   "medium", "https://leetcode.com/problems/subarray-sum-equals-k/");
    await upsertProblem(mArrays,   2, true,  "Minimum Window Substring",         "minimum-window-substring",                "hard",   "https://leetcode.com/problems/minimum-window-substring/");
    // Meta — Binary Search & Window
    await upsertProblem(mSearch,   1, true,  "Search in Rotated Sorted Array",   "search-in-rotated-sorted-array",          "medium", "https://leetcode.com/problems/search-in-rotated-sorted-array/");
    await upsertProblem(mSearch,   2, false, "Find Min in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array",    "medium", "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/");
    // Meta — Recursion & Backtracking
    await upsertProblem(mBacktrack,1, true,  "Permutations",                     "permutations",                            "medium", "https://leetcode.com/problems/permutations/");
    await upsertProblem(mBacktrack,2, true,  "Word Search",                      "word-search",                             "medium", "https://leetcode.com/problems/word-search/");

    // Amazon — Heaps
    await upsertProblem(aHeaps,  1, true,  "Merge k Sorted Lists",     "merge-k-sorted-lists",      "hard",   "https://leetcode.com/problems/merge-k-sorted-lists/");
    await upsertProblem(aHeaps,  2, false, "Top K Frequent Words",     "top-k-frequent-words",      "medium", "https://leetcode.com/problems/top-k-frequent-words/");
    // Amazon — Linked Lists & Stacks
    await upsertProblem(aStacks, 1, true,  "Valid Parentheses",        "valid-parentheses",         "easy",   "https://leetcode.com/problems/valid-parentheses/");
    await upsertProblem(aStacks, 2, true,  "Daily Temperatures",       "daily-temperatures",        "medium", "https://leetcode.com/problems/daily-temperatures/");
    // Amazon — Greedy & Intervals
    await upsertProblem(aGreedy, 1, true,  "Merge Intervals",          "merge-intervals",           "medium", "https://leetcode.com/problems/merge-intervals/");
    await upsertProblem(aGreedy, 2, true,  "Non-overlapping Intervals","non-overlapping-intervals",  "medium", "https://leetcode.com/problems/non-overlapping-intervals/");

    // Microsoft — Arrays & Sorting
    await upsertProblem(msArrays, 1, true,  "Sort Colors",                "sort-colors",               "medium", "https://leetcode.com/problems/sort-colors/");
    await upsertProblem(msArrays, 2, true,  "Find the Duplicate Number",  "find-the-duplicate-number", "medium", "https://leetcode.com/problems/find-the-duplicate-number/");
    // Microsoft — Trees & BST
    await upsertProblem(msTrees,  1, true,  "Validate Binary Search Tree",     "validate-binary-search-tree",                           "medium", "https://leetcode.com/problems/validate-binary-search-tree/");
    await upsertProblem(msTrees,  2, true,  "Lowest Common Ancestor of a BST", "lowest-common-ancestor-of-a-binary-search-tree",        "medium", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/");
    // Microsoft — OOD
    await upsertProblem(msDesign, 1, true,  "Design HashMap", "design-hashmap", "easy",   "https://leetcode.com/problems/design-hashmap/");
    await upsertProblem(msDesign, 2, false, "LRU Cache",      "lru-cache",      "medium", "https://leetcode.com/problems/lru-cache/");

    // Netflix — System Design Basics
    await upsertProblem(nxSystem, 1, true,  "Design Twitter",      "design-twitter",       "medium", "https://leetcode.com/problems/design-twitter/");
    await upsertProblem(nxSystem, 2, false, "Design Hit Counter",  "design-hit-counter",   "medium", "https://leetcode.com/problems/design-hit-counter/");
    // Netflix — Concurrency & Threading
    await upsertProblem(nxConc,   1, true,  "Print in Order",          "print-in-order",           "easy",   "https://leetcode.com/problems/print-in-order/");
    await upsertProblem(nxConc,   2, true,  "Print FooBar Alternately","print-foobar-alternately", "medium", "https://leetcode.com/problems/print-foobar-alternately/");

    // Apple — String Manipulation
    await upsertProblem(apStrings,1, true,  "Longest Palindromic Substring", "longest-palindromic-substring", "medium", "https://leetcode.com/problems/longest-palindromic-substring/");
    await upsertProblem(apStrings,2, true,  "Group Anagrams",                "group-anagrams",                "medium", "https://leetcode.com/problems/group-anagrams/");
    // Apple — Dynamic Programming
    await upsertProblem(apDP,     1, true,  "Coin Change",  "coin-change",  "medium", "https://leetcode.com/problems/coin-change/");
    await upsertProblem(apDP,     2, true,  "House Robber", "house-robber", "medium", "https://leetcode.com/problems/house-robber/");

    console.log("  ✓ Problems seeded");
    console.log("\nSeeding complete! 🎉");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
