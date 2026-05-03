-- Idempotent section/topic rebrand updates by stable slugs.
-- Safe to run multiple times.

UPDATE "topics"
SET "name" = 'Array Foundations'
WHERE "slug" = 'arrays';

UPDATE "topics"
SET "name" = 'Ordering Strategies'
WHERE "slug" = 'sorting';

UPDATE "topics"
SET "name" = 'Greedy Decisions'
WHERE "slug" = 'greedy';

UPDATE "topics"
SET "name" = 'State Transition Basics'
WHERE "slug" = 'dynamic-programming';

UPDATE "topics"
SET "name" = 'Binary Search Precision'
WHERE "slug" = 'binary-search';

UPDATE "topics"
SET "name" = 'Graph Traversal Core'
WHERE "slug" = 'graphs';

UPDATE "topics"
SET "name" = 'Tree Reasoning'
WHERE "slug" = 'trees';

UPDATE "topics"
SET "name" = 'Pointer Control'
WHERE "slug" = 'two-pointers';

UPDATE "sheet_sections"
SET
  "title" = 'Greedy Decisions',
  "description" = 'Builds optimal local-choice intuition to solve interval scheduling and exchange argument challenges.'
WHERE "slug" = 'greedy-algorithms';

UPDATE "sheet_sections"
SET
  "title" = 'Recursive Exploration',
  "description" = 'Builds recursive state modeling skills to handle complex constraint satisfaction problems.'
WHERE "slug" = 'recursion-and-backtracking';

UPDATE "sheet_sections"
SET
  "title" = 'Bitwise Toolkit',
  "description" = 'Builds bit-level manipulation fluency to solve memory-efficient subset and bitmask problems.'
WHERE "slug" = 'bit-manipulation';

UPDATE "sheet_sections"
SET
  "title" = 'Range Sum Patterns',
  "description" = 'Builds constant-time range querying skills to handle rapid interval updates.'
WHERE "slug" = 'prefix-sums-and-difference-array';

UPDATE "sheet_sections"
SET
  "title" = 'Binary Search Precision',
  "description" = 'Builds monotonic search space reduction skills to solve ''search on answer'' optimization problems.'
WHERE "slug" = 'binary-search';

UPDATE "sheet_sections"
SET
  "title" = 'Pointer Control',
  "description" = 'Builds array scanning efficiency to solve paired element and sliding window challenges.'
WHERE "slug" = 'two-pointers';

UPDATE "sheet_sections"
SET
  "title" = 'State Transition Basics',
  "description" = 'Builds overlapping subproblem recognition to handle optimal path and knapsack-style challenges.'
WHERE "slug" = 'dp';

UPDATE "sheet_sections"
SET
  "title" = 'Graph Traversal Core',
  "description" = 'Builds network traversal skills to solve shortest path and connectivity detection problems.'
WHERE "slug" = 'graphs';

