import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, ssl: "require" });
const db = drizzle(client, { schema });

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

const TOPICS = [
  { slug: "arrays", name: "Arrays" },
  { slug: "hash-map", name: "Hash Map" },
  { slug: "strings", name: "Strings" },
  { slug: "math", name: "Math" },
  { slug: "sorting", name: "Sorting" },
  { slug: "greedy", name: "Greedy" },
  { slug: "dynamic-programming", name: "Dynamic Programming" },
  { slug: "binary-search", name: "Binary Search" },
  { slug: "graphs", name: "Graphs" },
  { slug: "trees", name: "Trees" },
  { slug: "simulation", name: "Simulation" },
  { slug: "number-theory", name: "Number Theory" },
  { slug: "geometry", name: "Geometry" },
  { slug: "two-pointers", name: "Two Pointers" },
  { slug: "stack", name: "Stack" },
];

// ---------------------------------------------------------------------------
// Sheet Sections
// ---------------------------------------------------------------------------

const SHEET_SECTIONS: {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
}[] = [
  { slug: "cpp-basics", title: "C++ Basics", description: "Core C++ syntax, I/O, data types, and control flow fundamentals.", sortOrder: 1 },
  { slug: "cpp-stl", title: "C++ STL", description: "Standard Template Library containers, iterators, and algorithms.", sortOrder: 2 },
  { slug: "math-for-beginners", title: "Math for Beginners", description: "Number properties, modular arithmetic, and basic combinatorics.", sortOrder: 3 },
  { slug: "codeforces-a-grind", title: "Codeforces Problem A Grind", description: "High-volume practice on Codeforces Div. 2 A-level problems.", sortOrder: 4 },
  { slug: "greedy-algorithms", title: "Greedy Algorithms", description: "Exchange arguments, greedy choice property, and interval scheduling.", sortOrder: 5 },
  { slug: "recursion-and-backtracking", title: "Recursion and Backtracking", description: "Recursive thinking, call stacks, pruning, and constraint satisfaction.", sortOrder: 6 },
  { slug: "bit-manipulation", title: "Bit Manipulation", description: "Bitwise operators, bitmasks, and bit tricks for competitive programming.", sortOrder: 7 },
  { slug: "prefix-sums-and-difference-array", title: "Prefix Sums and Difference Array", description: "Range sum queries and efficient range update techniques.", sortOrder: 8 },
  { slug: "constructive-algorithms", title: "Constructive Algorithms", description: "Building explicit constructions and proving existence of solutions.", sortOrder: 9 },
  { slug: "codeforces-b-grind", title: "Codeforces Problem B Grind", description: "High-volume practice on Codeforces Div. 2 B-level problems.", sortOrder: 10 },
  { slug: "binary-search", title: "Binary Search", description: "Binary search on answer, search space reduction, and monotone predicates.", sortOrder: 11 },
  { slug: "two-pointers", title: "Two Pointers", description: "Sliding window and two-pointer techniques for array and string problems.", sortOrder: 12 },
  { slug: "number-theory", title: "Number Theory", description: "GCD, prime sieve, factorization, and modular inverse.", sortOrder: 13 },
  { slug: "codeforces-c-grind", title: "Codeforces Problem C Grind", description: "High-volume practice on Codeforces Div. 2 C-level problems.", sortOrder: 14 },
  { slug: "interactive-problems", title: "Interactive Problems", description: "Query-based problems with binary search and adaptive strategies.", sortOrder: 15 },
  { slug: "dp", title: "DP", description: "Dynamic programming from fundamentals to classical patterns.", sortOrder: 16 },
  { slug: "graphs", title: "Graphs", description: "BFS, DFS, shortest paths, topological sort, and cycle detection.", sortOrder: 17 },
  { slug: "dsu", title: "DSU", description: "Disjoint Set Union with union by rank and path compression.", sortOrder: 18 },
  { slug: "segment-trees-and-lazy-propagation", title: "Segment Trees and Lazy Propagation", description: "Range query and range update data structures.", sortOrder: 19 },
  { slug: "codeforces-d-grind", title: "Codeforces Problem D Grind", description: "High-volume practice on Codeforces Div. 2 D-level problems.", sortOrder: 20 },
  { slug: "non-standard-dp", title: "Non-standard DP Problems", description: "Bitmask DP, digit DP, DP on trees, and other advanced patterns.", sortOrder: 21 },
  { slug: "non-standard-graphs", title: "Non-standard Graph Problems", description: "Strongly connected components, bridges, articulation points, and flows.", sortOrder: 22 },
  { slug: "advanced-number-theory", title: "Advanced Number Theory", description: "Chinese Remainder Theorem, Euler's totient, and multiplicative functions.", sortOrder: 23 },
  { slug: "combinatorics-and-probability", title: "Combinatorics and Probability", description: "Counting techniques, expected value, and probabilistic arguments.", sortOrder: 24 },
  { slug: "string-advanced-algorithms", title: "String Advanced Algorithms", description: "KMP, Z-function, suffix arrays, and Aho-Corasick automaton.", sortOrder: 25 },
  { slug: "game-theory", title: "Game Theory: Basic to Advanced", description: "Sprague-Grundy theorem, Nim variants, and combinatorial game theory.", sortOrder: 26 },
  { slug: "codeforces-e-grind", title: "Codeforces Problem E Grind", description: "High-volume practice on Codeforces Div. 1 D/E-level problems.", sortOrder: 27 },
];

// ---------------------------------------------------------------------------
// Codeforces problems (guaranteed subset for sync demo)
// ---------------------------------------------------------------------------

const CF_PROBLEMS: {
  title: string;
  source: string;
  rating: number;
  contestId: number;
  index: string;
  topicSlugs: string[];
}[] = [
  { title: "Watermelon", source: "Codeforces 4A", rating: 800, contestId: 4, index: "A", topicSlugs: ["math"] },
  { title: "Way Too Long Words", source: "Codeforces 71A", rating: 800, contestId: 71, index: "A", topicSlugs: ["strings"] },
  { title: "Team", source: "Codeforces 231A", rating: 800, contestId: 231, index: "A", topicSlugs: ["greedy"] },
  { title: "Bit++", source: "Codeforces 282A", rating: 800, contestId: 282, index: "A", topicSlugs: ["simulation"] },
  { title: "Next Round", source: "Codeforces 158A", rating: 800, contestId: 158, index: "A", topicSlugs: ["arrays"] },
  { title: "Beautiful Matrix", source: "Codeforces 263A", rating: 800, contestId: 263, index: "A", topicSlugs: ["simulation"] },
  { title: "Petya and Strings", source: "Codeforces 112A", rating: 800, contestId: 112, index: "A", topicSlugs: ["strings"] },
  { title: "Stones on the Table", source: "Codeforces 266A", rating: 800, contestId: 266, index: "A", topicSlugs: ["strings"] },
  { title: "Bear and Big Brother", source: "Codeforces 791A", rating: 800, contestId: 791, index: "A", topicSlugs: ["simulation", "math"] },
  { title: "Elephant", source: "Codeforces 617A", rating: 800, contestId: 617, index: "A", topicSlugs: ["math"] },
  { title: "Soldier and Bananas", source: "Codeforces 546A", rating: 800, contestId: 546, index: "A", topicSlugs: ["math"] },
  { title: "Anton and Danik", source: "Codeforces 734A", rating: 800, contestId: 734, index: "A", topicSlugs: ["strings"] },
  { title: "Vanya and Fence", source: "Codeforces 677A", rating: 800, contestId: 677, index: "A", topicSlugs: ["arrays"] },
  { title: "Theatre Square", source: "Codeforces 1A", rating: 1000, contestId: 1, index: "A", topicSlugs: ["math"] },
  { title: "String Task", source: "Codeforces 118A", rating: 1000, contestId: 118, index: "A", topicSlugs: ["strings"] },
  { title: "Young Physicist", source: "Codeforces 69A", rating: 1000, contestId: 69, index: "A", topicSlugs: ["math"] },
  { title: "Even Odds", source: "Codeforces 318A", rating: 1200, contestId: 318, index: "A", topicSlugs: ["math"] },
  { title: "IQ Test", source: "Codeforces 25A", rating: 1300, contestId: 25, index: "A", topicSlugs: ["math"] },
  { title: "Nearly Lucky Number", source: "Codeforces 110A", rating: 800, contestId: 110, index: "A", topicSlugs: ["strings"] },
  { title: "Boy or Girl", source: "Codeforces 236A", rating: 800, contestId: 236, index: "A", topicSlugs: ["hash-map", "strings"] },
  { title: "Gravity Flip", source: "Codeforces 405A", rating: 900, contestId: 405, index: "A", topicSlugs: ["sorting", "greedy"] },
  { title: "Domino Piling", source: "Codeforces 50A", rating: 800, contestId: 50, index: "A", topicSlugs: ["math", "greedy"] },
  { title: "Chat Room", source: "Codeforces 58A", rating: 1000, contestId: 58, index: "A", topicSlugs: ["strings", "greedy"] },
  { title: "In Search of Intensity", source: "Codeforces 1920A", rating: 800, contestId: 1920, index: "A", topicSlugs: ["arrays"] },
  { title: "Satisfying Constraints", source: "Codeforces 1920B", rating: 1100, contestId: 1920, index: "B", topicSlugs: ["math", "sorting"] },
];

// ---------------------------------------------------------------------------
// Custom problems (fill up to 100+)
// ---------------------------------------------------------------------------

const CUSTOM_MIX: {
  title: string;
  source: string;
  rating: number;
  topicSlugs: string[];
}[] = [
  { title: "Two Sum", source: "LeetCode 1", rating: 800, topicSlugs: ["arrays", "hash-map"] },
  { title: "Valid Parentheses", source: "LeetCode 20", rating: 900, topicSlugs: ["stack", "strings"] },
  { title: "Merge Two Sorted Lists", source: "LeetCode 21", rating: 900, topicSlugs: ["sorting"] },
  { title: "Best Time to Buy and Sell Stock", source: "LeetCode 121", rating: 900, topicSlugs: ["arrays", "greedy"] },
  { title: "Maximum Subarray", source: "LeetCode 53", rating: 1000, topicSlugs: ["arrays", "dynamic-programming"] },
  { title: "Climbing Stairs", source: "LeetCode 70", rating: 800, topicSlugs: ["dynamic-programming", "math"] },
  { title: "Binary Search", source: "LeetCode 704", rating: 800, topicSlugs: ["binary-search", "arrays"] },
  { title: "Linked List Cycle", source: "LeetCode 141", rating: 900, topicSlugs: ["two-pointers"] },
  { title: "Reverse Linked List", source: "LeetCode 206", rating: 900, topicSlugs: ["arrays"] },
  { title: "Invert Binary Tree", source: "LeetCode 226", rating: 800, topicSlugs: ["trees"] },
  { title: "Diameter of Binary Tree", source: "LeetCode 543", rating: 900, topicSlugs: ["trees"] },
  { title: "Balanced Binary Tree", source: "LeetCode 110", rating: 900, topicSlugs: ["trees"] },
  { title: "Flood Fill", source: "LeetCode 733", rating: 1000, topicSlugs: ["graphs"] },
  { title: "Number of Islands", source: "LeetCode 200", rating: 1200, topicSlugs: ["graphs"] },
  { title: "Longest Common Prefix", source: "LeetCode 14", rating: 800, topicSlugs: ["strings"] },
  { title: "Contains Duplicate", source: "LeetCode 217", rating: 800, topicSlugs: ["arrays", "hash-map", "sorting"] },
  { title: "Meeting Rooms", source: "LeetCode 252", rating: 900, topicSlugs: ["sorting"] },
  { title: "Product of Array Except Self", source: "LeetCode 238", rating: 1100, topicSlugs: ["arrays"] },
  { title: "3Sum", source: "LeetCode 15", rating: 1300, topicSlugs: ["arrays", "two-pointers", "sorting"] },
  { title: "Container With Most Water", source: "LeetCode 11", rating: 1200, topicSlugs: ["arrays", "two-pointers", "greedy"] },
  { title: "Group Anagrams", source: "LeetCode 49", rating: 1100, topicSlugs: ["strings", "hash-map", "sorting"] },
  { title: "Course Schedule", source: "LeetCode 207", rating: 1400, topicSlugs: ["graphs"] },
  { title: "Coin Change", source: "LeetCode 322", rating: 1400, topicSlugs: ["dynamic-programming"] },
  { title: "Word Break", source: "LeetCode 139", rating: 1400, topicSlugs: ["dynamic-programming", "strings"] },
  { title: "House Robber", source: "LeetCode 198", rating: 1200, topicSlugs: ["dynamic-programming"] },
  { title: "Longest Increasing Subsequence", source: "LeetCode 300", rating: 1500, topicSlugs: ["dynamic-programming", "binary-search"] },
  { title: "Kth Largest Element", source: "LeetCode 215", rating: 1200, topicSlugs: ["sorting"] },
  { title: "Min Stack", source: "LeetCode 155", rating: 1000, topicSlugs: ["stack"] },
  { title: "Daily Temperatures", source: "LeetCode 739", rating: 1100, topicSlugs: ["stack"] },
  { title: "Rotate Image", source: "LeetCode 48", rating: 1100, topicSlugs: ["arrays", "math"] },
  { title: "Spiral Matrix", source: "LeetCode 54", rating: 1200, topicSlugs: ["arrays", "simulation"] },
  { title: "Set Matrix Zeroes", source: "LeetCode 73", rating: 1100, topicSlugs: ["arrays", "hash-map"] },
  { title: "Word Search", source: "LeetCode 79", rating: 1300, topicSlugs: ["graphs", "strings"] },
  { title: "Subsets", source: "LeetCode 78", rating: 1200, topicSlugs: ["arrays"] },
  { title: "Permutations", source: "LeetCode 46", rating: 1200, topicSlugs: ["arrays"] },
  { title: "Combination Sum", source: "LeetCode 39", rating: 1300, topicSlugs: ["arrays"] },
  { title: "Letter Combinations", source: "LeetCode 17", rating: 1200, topicSlugs: ["strings"] },
  { title: "Palindrome Partitioning", source: "LeetCode 131", rating: 1400, topicSlugs: ["strings", "dynamic-programming"] },
  { title: "Minimum Path Sum", source: "LeetCode 64", rating: 1200, topicSlugs: ["dynamic-programming", "arrays"] },
  { title: "Unique Paths", source: "LeetCode 62", rating: 1100, topicSlugs: ["dynamic-programming", "math"] },
  { title: "Jump Game", source: "LeetCode 55", rating: 1200, topicSlugs: ["greedy", "arrays"] },
  { title: "Merge Intervals", source: "LeetCode 56", rating: 1200, topicSlugs: ["sorting", "arrays"] },
  { title: "Insert Interval", source: "LeetCode 57", rating: 1200, topicSlugs: ["sorting", "arrays"] },
  { title: "Search in Rotated Sorted Array", source: "LeetCode 33", rating: 1300, topicSlugs: ["binary-search", "arrays"] },
  { title: "Find Minimum in Rotated Sorted Array", source: "LeetCode 153", rating: 1200, topicSlugs: ["binary-search", "arrays"] },
  { title: "Matrix Diagonal Sum", source: "LeetCode 1572", rating: 800, topicSlugs: ["arrays", "math"] },
  { title: "Richest Customer Wealth", source: "LeetCode 1672", rating: 800, topicSlugs: ["arrays"] },
  { title: "Number of Good Pairs", source: "LeetCode 1512", rating: 800, topicSlugs: ["arrays", "hash-map", "math"] },
  { title: "Shuffle the Array", source: "LeetCode 1470", rating: 800, topicSlugs: ["arrays"] },
  { title: "Running Sum of 1d Array", source: "LeetCode 1480", rating: 800, topicSlugs: ["arrays"] },
  { title: "Kids With Candies", source: "LeetCode 1431", rating: 800, topicSlugs: ["arrays"] },
  { title: "Fibonacci Number", source: "LeetCode 509", rating: 800, topicSlugs: ["dynamic-programming", "math"] },
  { title: "Power of Two", source: "LeetCode 231", rating: 800, topicSlugs: ["math"] },
  { title: "Roman to Integer", source: "LeetCode 13", rating: 900, topicSlugs: ["strings", "hash-map", "math"] },
  { title: "Palindrome Number", source: "LeetCode 9", rating: 800, topicSlugs: ["math"] },
  { title: "FizzBuzz", source: "LeetCode 412", rating: 800, topicSlugs: ["simulation", "math", "strings"] },
  { title: "Move Zeroes", source: "LeetCode 283", rating: 800, topicSlugs: ["arrays", "two-pointers"] },
  { title: "Squares of a Sorted Array", source: "LeetCode 977", rating: 800, topicSlugs: ["arrays", "sorting", "two-pointers"] },
  { title: "Remove Duplicates from Sorted Array", source: "LeetCode 26", rating: 800, topicSlugs: ["arrays", "two-pointers"] },
  { title: "Plus One", source: "LeetCode 66", rating: 800, topicSlugs: ["arrays", "math"] },
  { title: "Single Number", source: "LeetCode 136", rating: 900, topicSlugs: ["arrays", "math"] },
  { title: "Majority Element", source: "LeetCode 169", rating: 900, topicSlugs: ["arrays", "sorting"] },
  { title: "Pascal Triangle", source: "LeetCode 118", rating: 800, topicSlugs: ["arrays", "dynamic-programming"] },
  { title: "Missing Number", source: "LeetCode 268", rating: 800, topicSlugs: ["arrays", "math"] },
  { title: "Counting Bits", source: "LeetCode 338", rating: 900, topicSlugs: ["dynamic-programming", "math"] },
  { title: "Reverse String", source: "LeetCode 344", rating: 800, topicSlugs: ["strings", "two-pointers"] },
  { title: "Intersection of Two Arrays II", source: "LeetCode 350", rating: 800, topicSlugs: ["arrays", "hash-map", "sorting"] },
  { title: "First Unique Character", source: "LeetCode 387", rating: 800, topicSlugs: ["strings", "hash-map"] },
  { title: "Find All Duplicates in Array", source: "LeetCode 442", rating: 1100, topicSlugs: ["arrays", "hash-map"] },
  { title: "Hamming Distance", source: "LeetCode 461", rating: 800, topicSlugs: ["math"] },
  { title: "Island Perimeter", source: "LeetCode 463", rating: 900, topicSlugs: ["arrays", "graphs"] },
  { title: "Assign Cookies", source: "LeetCode 455", rating: 800, topicSlugs: ["greedy", "sorting", "arrays"] },
  { title: "Reshape the Matrix", source: "LeetCode 566", rating: 800, topicSlugs: ["arrays", "simulation"] },
  { title: "Subtree of Another Tree", source: "LeetCode 572", rating: 900, topicSlugs: ["trees"] },
  { title: "Range Sum Query", source: "LeetCode 303", rating: 800, topicSlugs: ["arrays", "dynamic-programming"] },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding CP Sheets...");

  // 1. Upsert topics
  let topicCount = 0;
  for (const t of TOPICS) {
    const existing = await db
      .select({ id: schema.topics.id })
      .from(schema.topics)
      .where(eq(schema.topics.slug, t.slug));
    if (existing.length === 0) {
      await db.insert(schema.topics).values(t);
      topicCount++;
    }
  }
  console.log(`Topics: ${topicCount} created, ${TOPICS.length - topicCount} already existed`);

  // Build slug->id map
  const allTopics = await db.select({ id: schema.topics.id, slug: schema.topics.slug }).from(schema.topics);
  const slugToId = new Map(allTopics.map((t) => [t.slug, t.id]));

  // 2. Upsert CF problems
  let cfInserted = 0;
  for (const p of CF_PROBLEMS) {
    const existing = await db
      .select({ id: schema.problems.id })
      .from(schema.problems)
      .where(
        and(
          eq(schema.problems.platform, "codeforces"),
          eq(schema.problems.externalContestId, p.contestId),
          eq(schema.problems.externalProblemIndex, p.index),
        ),
      );
    if (existing.length > 0) continue;

    const [newProblem] = await db
      .insert(schema.problems)
      .values({
        title: p.title,
        source: p.source,
        rating: p.rating,
        platform: "codeforces",
        externalContestId: p.contestId,
        externalProblemIndex: p.index,
        isPublished: true,
      })
      .returning({ id: schema.problems.id });

    const topicIds = p.topicSlugs.map((s) => slugToId.get(s)).filter(Boolean) as string[];
    if (topicIds.length > 0) {
      await db.insert(schema.problemTopics).values(
        topicIds.map((topicId) => ({ problemId: newProblem.id, topicId })),
      );
    }
    cfInserted++;
  }
  console.log(`CF problems: ${cfInserted} created, ${CF_PROBLEMS.length - cfInserted} already existed`);

  // 3. Upsert custom problems (match by title+source to avoid dupes)
  let customInserted = 0;
  for (const p of CUSTOM_MIX) {
    const existing = await db
      .select({ id: schema.problems.id })
      .from(schema.problems)
      .where(
        and(
          eq(schema.problems.title, p.title),
          eq(schema.problems.source, p.source),
        ),
      );
    if (existing.length > 0) continue;

    const [newProblem] = await db
      .insert(schema.problems)
      .values({
        title: p.title,
        source: p.source,
        rating: p.rating,
        platform: "custom",
        isPublished: true,
      })
      .returning({ id: schema.problems.id });

    const topicIds = p.topicSlugs.map((s) => slugToId.get(s)).filter(Boolean) as string[];
    if (topicIds.length > 0) {
      await db.insert(schema.problemTopics).values(
        topicIds.map((topicId) => ({ problemId: newProblem.id, topicId })),
      );
    }
    customInserted++;
  }
  console.log(`Custom problems: ${customInserted} created, ${CUSTOM_MIX.length - customInserted} already existed`);

  // 4. Upsert sheet sections (idempotent by slug)
  let sectionsInserted = 0;
  for (const s of SHEET_SECTIONS) {
    const existing = await db
      .select({ id: schema.sheetSections.id })
      .from(schema.sheetSections)
      .where(eq(schema.sheetSections.slug, s.slug));
    if (existing.length === 0) {
      await db.insert(schema.sheetSections).values({
        slug: s.slug,
        title: s.title,
        description: s.description,
        sortOrder: s.sortOrder,
        isPublished: true,
      });
      sectionsInserted++;
    }
  }
  console.log(`Sheet sections: ${sectionsInserted} created, ${SHEET_SECTIONS.length - sectionsInserted} already existed`);

  const total = CF_PROBLEMS.length + CUSTOM_MIX.length;
  console.log(`\nSeed complete. ${total} problems defined, ${cfInserted + customInserted} newly inserted. ${sectionsInserted} sections inserted.`);

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
