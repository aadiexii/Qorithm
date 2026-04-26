"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProblemAction, type ActionState } from "@/features/problems/actions";

type Topic = {
  id: string;
  name: string;
};

type CreateProblemFormProps = {
  topics: Topic[];
};

const initialState: ActionState = {
  success: false,
  message: "",
};

export function CreateProblemForm({ topics }: CreateProblemFormProps) {
  const [state, formAction, isPending] = useActionState(createProblemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Add a Problem</CardTitle>
        <CardDescription>Enter details and assign topics to track your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" placeholder="e.g. Two Sum" required />
              {state.errors?.title && <p className="text-sm text-red-600">{state.errors.title[0]}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Input id="source" name="source" placeholder="e.g. LeetCode" required />
              {state.errors?.source && <p className="text-sm text-red-600">{state.errors.source[0]}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rating">Rating / Difficulty</Label>
            <Input id="rating" name="rating" type="number" min="1" placeholder="e.g. 800 (Optional)" />
            {state.errors?.rating && <p className="text-sm text-red-600">{state.errors.rating[0]}</p>}
          </div>

          {topics.length > 0 && (
            <div className="space-y-2">
              <Label>Topics</Label>
              <div className="flex flex-wrap gap-3 rounded-md border border-border p-3">
                {topics.map((topic) => (
                  <label key={topic.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="topicIds"
                      value={topic.id}
                      className="size-4 rounded border-border text-accent accent-accent"
                    />
                    {topic.name}
                  </label>
                ))}
              </div>
              {state.errors?.topicIds && <p className="text-sm text-red-600">{state.errors.topicIds[0]}</p>}
            </div>
          )}

          {state.message && (
            <div className={`rounded-md p-3 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {state.message}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? "Creating..." : "Create Problem"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
