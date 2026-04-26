"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Topic = {
  id: string;
  name: string;
};

type ProblemsFilterBarProps = {
  topics: Topic[];
};

export function ProblemsFilterBar({ topics }: ProblemsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const minRating = searchParams.get("minRating") ?? "";
  const maxRating = searchParams.get("maxRating") ?? "";

  const applyFilters = useCallback(
    (formData: FormData) => {
      const params = new URLSearchParams();
      const qVal = formData.get("q")?.toString().trim();
      const topicVal = formData.get("topic")?.toString();
      const minVal = formData.get("minRating")?.toString().trim();
      const maxVal = formData.get("maxRating")?.toString().trim();

      if (qVal) params.set("q", qVal);
      if (topicVal) params.set("topic", topicVal);
      if (minVal) params.set("minRating", minVal);
      if (maxVal) params.set("maxRating", maxVal);
      // Reset to page 1 when filters change
      params.set("page", "1");

      router.push(`/problems?${params.toString()}`);
    },
    [router],
  );

  function resetFilters() {
    router.push("/problems");
  }

  return (
    <form action={applyFilters} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="filter-q" className="text-xs">
          Search
        </Label>
        <Input
          id="filter-q"
          name="q"
          placeholder="Title or source…"
          defaultValue={q}
          className="h-9 w-44"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="filter-topic" className="text-xs">
          Topic
        </Label>
        <select
          id="filter-topic"
          name="topic"
          defaultValue={topic}
          className="flex h-9 w-36 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="filter-min" className="text-xs">
          Min Rating
        </Label>
        <Input
          id="filter-min"
          name="minRating"
          type="number"
          min="1"
          placeholder="e.g. 800"
          defaultValue={minRating}
          className="h-9 w-28"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="filter-max" className="text-xs">
          Max Rating
        </Label>
        <Input
          id="filter-max"
          name="maxRating"
          type="number"
          min="1"
          placeholder="e.g. 2000"
          defaultValue={maxRating}
          className="h-9 w-28"
        />
      </div>

      <Button type="submit" size="sm" className="h-9">
        Apply
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-9" onClick={resetFilters}>
        Reset
      </Button>
    </form>
  );
}
