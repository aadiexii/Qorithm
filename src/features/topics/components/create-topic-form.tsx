"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopicAction, type ActionState } from "@/features/topics/actions";

const initialState: ActionState = {};

export function CreateTopicForm() {
  const [state, formAction, isPending] = useActionState(createTopicAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Add a Topic</CardTitle>
        <CardDescription>
          Topics are used to tag and filter problems across the catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Name *</Label>
              <Input id="topic-name" name="name" placeholder="e.g. Dynamic Programming" required />
              {state.errors?.name && (
                <p className="text-sm text-red-600">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-slug">Slug *</Label>
              <Input
                id="topic-slug"
                name="slug"
                placeholder="e.g. dynamic-programming"
                required
              />
              {state.errors?.slug && (
                <p className="text-sm text-red-600">{state.errors.slug[0]}</p>
              )}
            </div>
          </div>

          {state.message && (
            <div
              className={`rounded-md p-3 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {state.message}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? "Creating..." : "Create Topic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
