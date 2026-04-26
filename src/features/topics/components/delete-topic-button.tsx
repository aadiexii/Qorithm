"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteTopicAction } from "@/features/topics/actions";

type DeleteTopicButtonProps = {
  topicId: string;
  topicName: string;
  usageCount: number;
};

export function DeleteTopicButton({ topicId, topicName, usageCount }: DeleteTopicButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const warning =
      usageCount > 0
        ? `Delete "${topicName}"? It is linked to ${usageCount} problem(s). The problems themselves will NOT be deleted, but the topic tag will be removed.`
        : `Delete "${topicName}"? This cannot be undone.`;

    const confirmed = window.confirm(warning);
    if (!confirmed) return;

    startTransition(() => {
      void deleteTopicAction(topicId);
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "…" : "Delete"}
    </Button>
  );
}
