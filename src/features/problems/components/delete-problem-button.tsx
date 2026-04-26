"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteProblemAction } from "@/features/problems/actions";

type DeleteProblemButtonProps = {
  problemId: string;
  problemTitle: string;
};

export function DeleteProblemButton({ problemId, problemTitle }: DeleteProblemButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${problemTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    startTransition(() => {
      void deleteProblemAction(problemId);
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "…" : "Delete"}
    </Button>
  );
}
