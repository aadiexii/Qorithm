-- Custom SQL migration file, put your code below! --

-- 1. Reset visibility of all legacy or empty sections
UPDATE "sheet_sections"
SET "is_published" = false;

-- 2. Republish only the strictly defined 30-section curriculum
UPDATE "sheet_sections"
SET "is_published" = true
WHERE "slug" IN (
  'cpp-core-foundations',
  'stl-in-practice',
  'math-essentials-for-cp',
  'implementation-basics',
  'greedy-decisions',
  'recursive-exploration',
  'bitwise-toolkit',
  'range-sum-patterns',
  'binary-search-precision',
  'pointer-control',
  'sorting-and-order-logic',
  'constructive-strategies',
  'state-transition-basics-dp-i',
  'graph-traversal-core',
  'tree-reasoning-core',
  'dsu-and-component-merging',
  'segment-trees-in-practice',
  'number-theory-core',
  'combinatorics-and-probability',
  'string-algorithms-core',
  'advanced-dp-patterns',
  'advanced-graph-techniques',
  'advanced-number-theory',
  'game-theory-essentials',
  'mixed-checkpoint-set-a',
  'mixed-checkpoint-set-b',
  'mixed-checkpoint-set-c',
  'contest-readiness-set-d',
  'contest-readiness-set-e',
  'elite-mixed-set-f'
);