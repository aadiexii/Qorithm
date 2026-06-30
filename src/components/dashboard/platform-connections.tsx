"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import { Button } from "@/components/molecules/button";
import { Input } from "@/components/molecules/input";
import { Unlink, Link2, AlertCircle, CheckCircle2 } from "lucide-react";
import { connectCodeforces, disconnectCodeforces } from "@/components/actions";

export function PlatformConnections({
  codeforcesHandle,
}: {
  codeforcesHandle: string | null;
}) {
  const [connectedHandle, setConnectedHandle] = useState<string | null>(
    codeforcesHandle,
  );
  const [handleInput, setHandleInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setSuccessMsg(null);
  }

  const handleConnect = () => {
    const trimmed = handleInput.trim();
    if (!trimmed) return;
    clearMessages();
    startTransition(async () => {
      const res = await connectCodeforces(trimmed);
      if (res.success) {
        setConnectedHandle(trimmed);
        setHandleInput("");
        setSuccessMsg("Codeforces account connected successfully.");
      } else {
        setError(res.error);
      }
    });
  };

  const handleDisconnect = () => {
    clearMessages();
    startTransition(async () => {
      await disconnectCodeforces();
      setConnectedHandle(null);
      setSuccessMsg("Codeforces account disconnected.");
    });
  };

  return (
    <Card className="bg-card/80 border-border/60">
      <CardHeader>
        <CardTitle>Codeforces</CardTitle>
        <CardDescription>
          {connectedHandle
            ? `Connected as ${connectedHandle}`
            : "Link your Codeforces account to unlock personalized daily challenges."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 p-3 text-sm text-accent">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!connectedHandle ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter your Codeforces handle"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConnect();
              }}
              disabled={isPending}
            />
            <Button
              onClick={handleConnect}
              disabled={isPending || !handleInput.trim()}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Connected as{" "}
              <span className="font-medium text-accent">
                {connectedHandle}
              </span>
            </span>
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-white/5"
              onClick={handleDisconnect}
              disabled={isPending}
              title="Disconnect Codeforces"
            >
              <Unlink className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
