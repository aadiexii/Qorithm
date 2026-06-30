"use client";

import { useState, useTransition } from "react";
import { Zap, Unlink, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  connectCodeforces,
  disconnectCodeforces,
} from "@/components/actions/connection-actions";

// ── Connected state — handle + disconnect ─────────────────────────────────────
export function CfConnectedBadge({
  initialHandle,
}: {
  initialHandle: string;
}) {
  const [handle, setHandle] = useState(initialHandle);
  const [isPending, startTransition] = useTransition();

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectCodeforces();
      setHandle("");
    });
  };

  if (!handle) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm font-medium text-slate-400">
        CF:{" "}
        <span className="font-semibold text-accent">{handle}</span>
      </span>
      <button
        onClick={handleDisconnect}
        disabled={isPending}
        title="Disconnect Codeforces"
        className="text-slate-600 hover:text-slate-300 disabled:opacity-40 transition-colors"
      >
        <Unlink className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Disconnected state — inline connect form ──────────────────────────────────
export function CfConnectInline() {
  const [handle, setHandle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const submit = () => {
    const trimmed = handle.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await connectCodeforces(trimmed);
      if (res.success) {
        setConnected(true);
      } else {
        setError(res.error);
      }
    });
  };

  if (connected) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected! Refreshing your daily challenge…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      <div className="flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
        <p className="text-xs font-semibold text-slate-300">
          Connect Codeforces to unlock your Daily Challenge &amp; streak
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Your CF handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={isPending}
          className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={isPending || !handle.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? "Connecting…" : "Connect"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
