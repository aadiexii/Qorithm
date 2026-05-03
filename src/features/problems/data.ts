export type ProblemPreview = {
  id: string;
  title: string;
  source: string;
  rating: number | null;
  externalDifficulty?: number | null;
  platform?: "custom" | "codeforces" | "atcoder";
  topics: string[];
};

export const placeholderProblems: ProblemPreview[] = [
  {
    id: "p-1",
    title: "Two Sum",
    source: "LeetCode",
    rating: null,
    topics: ["arrays", "hash-map"],
  },
  {
    id: "p-2",
    title: "B. Queue at the School",
    source: "Codeforces",
    rating: 800,
    topics: ["implementation", "simulation"],
  },
  {
    id: "p-3",
    title: "Static Range Sum",
    source: "CSES",
    rating: 1100,
    topics: ["prefix-sum"],
  },
];
