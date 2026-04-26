import { Suspense } from "react";

import { db } from "@/db";
import { topics } from "@/db/schema/problems";
import { queryProblems } from "@/features/problems/actions";
import { PaginationControls } from "@/features/problems/components/pagination-controls";
import { ProblemsFilterBar } from "@/features/problems/components/problems-filter-bar";
import { ProblemsTable } from "@/features/problems/components/problems-table";
import { getUserProblemStateMap } from "@/features/tracking/actions";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProblemsPage({ searchParams }: Props) {
  const params = await searchParams;

  // Ensure topics exist (idempotent seed from Sprint 1A)
  let allTopics = await db.query.topics.findMany({
    orderBy: (topics, { asc }) => [asc(topics.name)],
  });

  if (allTopics.length === 0) {
    await db.insert(topics).values([
      { slug: "arrays", name: "Arrays" },
      { slug: "hash-map", name: "Hash Map" },
      { slug: "simulation", name: "Simulation" },
    ]);
    allTopics = await db.query.topics.findMany({
      orderBy: (topics, { asc }) => [asc(topics.name)],
    });
  }

  // Parse query params
  const q = typeof params.q === "string" ? params.q : undefined;
  const topic = typeof params.topic === "string" ? params.topic : undefined;
  const minRating =
    typeof params.minRating === "string" ? Number(params.minRating) || undefined : undefined;
  const maxRating =
    typeof params.maxRating === "string" ? Number(params.maxRating) || undefined : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;

  const result = await queryProblems({ q, topic, minRating, maxRating, page, pageSize: 10 });

  // Fetch user tracking state for visible problems
  const problemIds = result.items.map((p) => p.id);
  const stateMap = await getUserProblemStateMap(problemIds);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Problems
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Problem catalog</h1>
        <p className="text-muted-foreground">
          Search and filter curated problems backed by your Supabase database.
        </p>
      </div>

      <Suspense fallback={null}>
        <ProblemsFilterBar topics={allTopics} />
      </Suspense>

      <ProblemsTable
        problems={result.items}
        total={result.total}
        stateMap={stateMap}
      />

      <Suspense fallback={null}>
        <PaginationControls page={result.page} totalPages={result.totalPages} />
      </Suspense>
    </div>
  );
}
