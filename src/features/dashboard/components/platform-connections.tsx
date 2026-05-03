"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectPlatform, disconnectPlatform, syncPlatform } from "../sync-actions";
import { RefreshCw, Unlink, Link2, AlertCircle } from "lucide-react";

export function PlatformConnections({
  codeforces,
  atcoder,
}: {
  codeforces: { handle: string | null; lastSync: Date | null };
  atcoder: { handle: string | null; lastSync: Date | null };
}) {
  return (
    <div className="space-y-6">
      <PlatformCard 
        platformId="codeforces" 
        title="Codeforces" 
        data={codeforces} 
      />
      <PlatformCard 
        platformId="atcoder" 
        title="AtCoder" 
        data={atcoder} 
      />
    </div>
  );
}

function PlatformCard({
  platformId,
  title,
  data,
}: {
  platformId: "codeforces" | "atcoder";
  title: string;
  data: { handle: string | null; lastSync: Date | null };
}) {
  const [handleInput, setHandleInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleConnect = () => {
    if (!handleInput) return;
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await connectPlatform(platformId, handleInput);
      if (res.success) {
        setSuccessMsg(`Connected to ${title}`);
        setHandleInput("");
      } else {
        setError(res.error || "Failed to connect");
      }
    });
  };

  const handleDisconnect = () => {
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      await disconnectPlatform(platformId);
    });
  };

  const handleSync = () => {
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await syncPlatform(platformId);
      if (res.success) {
        setSuccessMsg(`Synced successfully. Found ${res.count} new solves.`);
      } else {
        setError(res.error || "Failed to sync");
      }
    });
  };

  return (
    <Card className="bg-card/80 border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {data.handle 
            ? `Connected as ${data.handle}` 
            : `Link your ${title} account to sync solves`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 p-3 rounded border border-rose-500/20">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
            {successMsg}
          </div>
        )}

        {!data.handle ? (
          <div className="flex items-center gap-2">
            <Input 
              placeholder={`${title} Handle`}
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              disabled={isPending}
            />
            <Button onClick={handleConnect} disabled={isPending || !handleInput}>
              <Link2 className="w-4 h-4 mr-2" /> Connect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last synced: {data.lastSync ? new Date(data.lastSync).toLocaleString() : "Never"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleSync} disabled={isPending}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} /> 
                Sync Now
              </Button>
              <Button variant="ghost" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={handleDisconnect} disabled={isPending}>
                <Unlink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
