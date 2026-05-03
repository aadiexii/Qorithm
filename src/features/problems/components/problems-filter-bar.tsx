"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RATING_PRESETS = [
  { label: "800-999", min: 800, max: 999 },
  { label: "1000-1199", min: 1000, max: 1199 },
  { label: "1200-1399", min: 1200, max: 1399 },
  { label: "1400-1599", min: 1400, max: 1599 },
  { label: "1600-1899", min: 1600, max: 1899 },
  { label: "1900+", min: 1900, max: 3500 },
];

export function ProblemsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const minRating = searchParams.get("minRating") ?? "";
  const maxRating = searchParams.get("maxRating") ?? "";

  const applyFilters = useCallback(
    (formData: FormData) => {
      const params = new URLSearchParams();
      const qVal = formData.get("q")?.toString().trim();
      const minVal = formData.get("minRating")?.toString().trim();
      const maxVal = formData.get("maxRating")?.toString().trim();

      if (qVal) params.set("q", qVal);
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

  function applyPreset(min: number, max: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("minRating", min.toString());
    params.set("maxRating", max.toString());
    params.set("page", "1");
    router.push(`/problems?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
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
          <Label htmlFor="filter-min" className="text-xs">
            Min Rating
          </Label>
          <Input
            id="filter-min"
            name="minRating"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Min (e.g. 800)"
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Max (e.g. 2000)"
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

      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Presets:</span>
        {RATING_PRESETS.map((preset) => {
          const isActive = minRating === preset.min.toString() && maxRating === preset.max.toString();
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.min, preset.max)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
