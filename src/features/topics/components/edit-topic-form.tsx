"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTopicAction, type ActionState } from "@/features/topics/actions";

type EditTopicFormProps = {
  topic: { id: string; name: string; slug: string };
  onCancel: () => void;
};

const initialState: ActionState = {};

export function EditTopicForm({ topic, onCancel }: EditTopicFormProps) {
  const [state, formAction, isPending] = useActionState(updateTopicAction, initialState);

  if (state.success) {
    onCancel();
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
      <input type="hidden" name="id" value={topic.id} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`edit-name-${topic.id}`}>Name</Label>
          <Input
            id={`edit-name-${topic.id}`}
            name="name"
            defaultValue={topic.name}
            required
          />
          {state.errors?.name && <p className="text-xs text-red-600">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor={`edit-slug-${topic.id}`}>Slug</Label>
          <Input
            id={`edit-slug-${topic.id}`}
            name="slug"
            defaultValue={topic.slug}
            required
          />
          {state.errors?.slug && <p className="text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

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
