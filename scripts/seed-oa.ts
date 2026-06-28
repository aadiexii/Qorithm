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
    console.log("Seeding OA Companies, Sections, and Problems...");

    // 1. Insert Companies
    const insertedCompanies = await sql`
      INSERT INTO "companies" ("slug", "name", "logo", "difficulty", "description")
      VALUES 
        ('google', 'Google', NULL, 'Hard', 'Curated Google coding round PYQ roadmaps focusing on advanced graph techniques, trees, and dynamic programming.'),
        ('meta', 'Meta', NULL, 'Medium', 'Curated Meta coding round PYQs focusing on high-frequency arrays, strings, binary search, and sliding window.'),
        ('amazon', 'Amazon', NULL, 'Medium', 'Curated Amazon coding round PYQs covering heaps, priority queues, binary search, stacks, and queues.')
      ON CONFLICT ("slug") DO UPDATE 
      SET 
        "name" = EXCLUDED."name",
        "logo" = EXCLUDED."logo",
        "difficulty" = EXCLUDED."difficulty",
        "description" = EXCLUDED."description"
      RETURNING "id", "slug";
    `;

    const companyMap = new Map<string, string>(
      insertedCompanies.map((c) => [c.slug, c.id]),
    );

    // 2. Insert Sections
    const googleId = companyMap.get("google")!;
    const metaId = companyMap.get("meta")!;
    const amazonId = companyMap.get("amazon")!;

    // Google Sections
    const [googleGraphsSec, googleDPSec] = await Promise.all([
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${googleId}, 'Graphs & Trees', 'graphs-and-trees', 1, 'Standard graph traversals (DFS/BFS), union-find, topological sort, and tree algorithms.')
        RETURNING "id"
      `,
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${googleId}, 'Dynamic Programming', 'dp', 2, 'Curated DP tasks covering knapsack, range query DP, and state optimization.')
        RETURNING "id"
      `,
    ]);

    // Meta Sections
    const [metaArraysSec, metaSearchSec] = await Promise.all([
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${metaId}, 'Arrays & Strings', 'arrays-and-strings', 1, 'Two pointers, prefix sum, hash maps, and sliding window on arrays/strings.')
        RETURNING "id"
      `,
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${metaId}, 'Binary Search & Wind', 'binary-search-and-window', 2, 'Searching range patterns and dynamic size sliding windows.')
        RETURNING "id"
      `,
    ]);

    // Amazon Sections
    const [amazonHeapsSec, amazonStacksSec] = await Promise.all([
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${amazonId}, 'Heaps & Priority Queues', 'heaps', 1, 'K-way merge problems, running median, and dynamic top-K tracking.')
        RETURNING "id"
      `,
      sql`
        INSERT INTO "company_sections" ("company_id", "name", "slug", "sort_order", "description")
        VALUES (${amazonId}, 'Linked Lists & Stacks', 'lists-and-stacks', 2, 'Monotonic stack patterns and dynamic list pointers.')
        RETURNING "id"
      `,
    ]);

    // 3. Insert OA Problems
    const problemsData = [
      // Google Graphs
      {
        title: "Evaluate Division",
        slug: "evaluate-division",
        difficulty: "medium",
        platform: "leetcode",
        url: "https://leetcode.com/problems/evaluate-division/",
        sectionId: googleGraphsSec[0].id,
        order: 1,
        isRequired: true,
      },
      {
        title: "Cracking the Safe",
        slug: "cracking-the-safe",
        difficulty: "hard",
        platform: "leetcode",
        url: "https://leetcode.com/problems/cracking-the-safe/",
        sectionId: googleGraphsSec[0].id,
        order: 2,
        isRequired: false,
      },
      // Google DP
      {
        title: "Edit Distance",
        slug: "edit-distance",
        difficulty: "hard",
        platform: "leetcode",
        url: "https://leetcode.com/problems/edit-distance/",
        sectionId: googleDPSec[0].id,
        order: 1,
        isRequired: true,
      },
      // Meta Arrays
      {
        title: "Subarray Sum Equals K",
        slug: "subarray-sum-equals-k",
        difficulty: "medium",
        platform: "leetcode",
        url: "https://leetcode.com/problems/subarray-sum-equals-k/",
        sectionId: metaArraysSec[0].id,
        order: 1,
        isRequired: true,
      },
      {
        title: "Minimum Window Substring",
        slug: "minimum-window-substring",
        difficulty: "hard",
        platform: "leetcode",
        url: "https://leetcode.com/problems/minimum-window-substring/",
        sectionId: metaArraysSec[0].id,
        order: 2,
        isRequired: true,
      },
      // Meta Search
      {
        title: "Search in Rotated Sorted Array",
        slug: "search-in-rotated-sorted-array",
        difficulty: "medium",
        platform: "leetcode",
        url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        sectionId: metaSearchSec[0].id,
        order: 1,
        isRequired: true,
      },
      // Amazon Heaps
      {
        title: "Merge k Sorted Lists",
        slug: "merge-k-sorted-lists",
        difficulty: "hard",
        platform: "leetcode",
        url: "https://leetcode.com/problems/merge-k-sorted-lists/",
        sectionId: amazonHeapsSec[0].id,
        order: 1,
        isRequired: true,
      },
      {
        title: "Top K Frequent Words",
        slug: "top-k-frequent-words",
        difficulty: "medium",
        platform: "leetcode",
        url: "https://leetcode.com/problems/top-k-frequent-words/",
        sectionId: amazonHeapsSec[0].id,
        order: 2,
        isRequired: false,
      },
      // Amazon Stacks
      {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "easy",
        platform: "leetcode",
        url: "https://leetcode.com/problems/valid-parentheses/",
        sectionId: amazonStacksSec[0].id,
        order: 1,
        isRequired: true,
      },
    ];

    for (const prob of problemsData) {
      const [insertedProb] = await sql`
        INSERT INTO "oa_problems" ("title", "slug", "difficulty", "platform", "url")
        VALUES (${prob.title}, ${prob.slug}, ${prob.difficulty}, ${prob.platform}, ${prob.url})
        RETURNING "id"
      `;

      await sql`
        INSERT INTO "company_section_problems" ("section_id", "oa_problem_id", "order_index", "is_required")
        VALUES (${prob.sectionId}, ${insertedProb.id}, ${prob.order}, ${prob.isRequired})
        ON CONFLICT ("section_id", "oa_problem_id") DO NOTHING
      `;
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await sql.end();
  }
}

main();
