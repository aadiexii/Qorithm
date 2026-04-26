"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminCreateProblemAction, type ActionState } from "@/features/admin/actions";

type Topic = { id: string; name: string };

const initialState: ActionState = {};

export function AdminCreateProblemForm({ topics }: { topics: Topic[] }) {
  const [state, formAction, isPending] = useActionState(adminCreateProblemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Create Problem</CardTitle>
        <CardDescription>Add a new problem with platform mapping and publish control.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-title">Title *</Label>
              <Input id="admin-title" name="title" required />
              {state.errors?.title && <p className="text-sm text-red-600">{state.errors.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-source">Source *</Label>
              <Input id="admin-source" name="source" required />
              {state.errors?.source && <p className="text-sm text-red-600">{state.errors.source[0]}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="admin-rating">Rating</Label>
              <Input id="admin-rating" name="rating" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-platform">Platform</Label>
              <select id="admin-platform" name="platform" defaultValue="custom" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="custom">Custom</option>
                <option value="codeforces">Codeforces</option>
                <option value="atcoder">AtCoder</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-published">
                <input id="admin-published" name="isPublished" type="checkbox" value="true" className="mr-2" />
                Published
              </Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-extContest">External Contest ID</Label>
              <Input id="admin-extContest" name="externalContestId" type="number" placeholder="e.g. 1920" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-extIndex">External Problem Index</Label>
              <Input id="admin-extIndex" name="externalProblemIndex" placeholder="e.g. A" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Topics</Label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <label key={t.id} className="inline-flex items-center gap-1 text-sm">
                  <input type="checkbox" name="topicIds" value={t.id} />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          {state.message && (
            <div className={`rounded-md p-3 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {state.message}
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create Problem"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
