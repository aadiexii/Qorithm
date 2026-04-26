"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveCodeforcesHandleAction,
  syncCodeforcesSolvedAction,
  type SyncResult,
} from "@/features/codeforces/actions";

type CfSyncPanelProps = {
  initialHandle: string | null;
};

export function CfSyncPanel({ initialHandle }: CfSyncPanelProps) {
  const [handle, setHandle] = useState(initialHandle ?? "");
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isSyncing, startSync] = useTransition();

  const isPending = isSaving || isSyncing;
  const hasSavedHandle = !!initialHandle || saveMessage?.ok;

  function handleSave() {
    setSaveMessage(null);
    setSyncResult(null);
    startSave(() => {
      void (async () => {
        const result = await saveCodeforcesHandleAction(handle);
        setSaveMessage({ ok: result.success, text: result.message });
      })();
    });
  }

  function handleSync() {
    setSyncResult(null);
    startSync(() => {
      void (async () => {
        const result = await syncCodeforcesSolvedAction();
        setSyncResult(result);
      })();
    });
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Codeforces Sync</CardTitle>
        <CardDescription>
          Connect your Codeforces handle to automatically mark solved problems in your tracker.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Handle input */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cf-handle">Codeforces Handle</Label>
            <div className="flex gap-2">
              <Input
                id="cf-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. tourist"
                disabled={isPending}
                className="max-w-xs"
              />
              <Button onClick={handleSave} disabled={isPending || !handle.trim()} size="default">
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>

          {saveMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                saveMessage.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>

        {/* Sync button */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSync}
              disabled={isPending || !hasSavedHandle}
              variant="default"
            >
              {isSyncing ? "Syncing…" : "Sync Solved Problems"}
            </Button>
            {!hasSavedHandle && (
              <span className="text-sm text-muted-foreground">Save a handle first to sync.</span>
            )}
          </div>

          {syncResult && (
            <div
              className={`rounded-md p-4 text-sm ${
                syncResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              <p className="font-medium">{syncResult.message}</p>
              {syncResult.success && syncResult.fetched !== undefined && (
                <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
                  <li>Submissions fetched: {syncResult.fetched}</li>
                  <li>Unique accepted: {syncResult.accepted}</li>
                  <li>Matched local problems: {syncResult.matchedLocal}</li>
                  <li>States updated: {syncResult.updatedStates}</li>
                </ul>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
