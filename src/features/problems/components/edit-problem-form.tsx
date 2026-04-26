"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProblemAction, type ActionState } from "@/features/problems/actions";

type Topic = {
  id: string;
  name: string;
};

type EditProblemFormProps = {
  problem: {
    id: string;
    title: string;
    source: string;
    rating: number | null;
    problemTopics: { topicId: string }[];
  };
  topics: Topic[];
  onCancel: () => void;
};

const initialState: ActionState = {};

export function EditProblemForm({ problem, topics, onCancel }: EditProblemFormProps) {
  const [state, formAction, isPending] = useActionState(updateProblemAction, initialState);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(problem.problemTopics.map((pt) => pt.topicId)),
  );

  function toggleTopic(topicId: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  }

  if (state.success) {
    onCancel();
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
      <input type="hidden" name="id" value={problem.id} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor={`edit-title-${problem.id}`}>Title</Label>
          <Input
            id={`edit-title-${problem.id}`}
            name="title"
            defaultValue={problem.title}
            required
          />
          {state.errors?.title && <p className="text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor={`edit-source-${problem.id}`}>Source</Label>
          <Input
            id={`edit-source-${problem.id}`}
            name="source"
            defaultValue={problem.source}
            required
          />
          {state.errors?.source && <p className="text-xs text-red-600">{state.errors.source[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor={`edit-rating-${problem.id}`}>Rating</Label>
          <Input
            id={`edit-rating-${problem.id}`}
            name="rating"
            type="number"
            min="1"
            defaultValue={problem.rating ?? ""}
          />
          {state.errors?.rating && <p className="text-xs text-red-600">{state.errors.rating[0]}</p>}
        </div>
      </div>

      {topics.length > 0 && (
        <div className="space-y-1">
          <Label>Topics</Label>
          <div className="flex flex-wrap gap-3 rounded-md border border-border bg-background p-2">
            {topics.map((topic) => (
              <label key={topic.id} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="topicIds"
                  value={topic.id}
                  checked={selectedTopics.has(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                  className="size-3.5 rounded border-border accent-accent"
                />
                {topic.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {state.message && !state.success && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
