"use client";

import { useState, useTransition, useEffect } from "react";
import { Zap, Unlink, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  connectCodeforces,
  disconnectCodeforces,
  checkCfVerification,
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

// ── Disconnected / Pending / Re-verification UI ──────────────────────────────
interface CfConnectInlineProps {
  initialPendingHandle?: string | null;
  initialVerificationCode?: string | null;
  initialVerificationExpires?: string | null;
  needsReverification?: boolean;
  legacyHandle?: string | null;
}

export function CfConnectInline({
  initialPendingHandle,
  initialVerificationCode,
  initialVerificationExpires,
  needsReverification = false,
  legacyHandle,
}: CfConnectInlineProps) {
  const [handle, setHandle] = useState(legacyHandle || "");
  const [isPending, startTransition] = useTransition();
  const [isChecking, startCheckTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Verification code states
  const [pendingHandle, setPendingHandle] = useState(initialPendingHandle || "");
  const [verificationCode, setVerificationCode] = useState(initialVerificationCode || "");
  const [expiresTime, setExpiresTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Initialize and run countdown
  useEffect(() => {
    if (initialVerificationExpires) {
      const expTime = new Date(initialVerificationExpires).getTime();
      if (expTime > Date.now()) {
        setExpiresTime(expTime);
      } else {
        // Already expired on load, clean up state
        setPendingHandle("");
        setVerificationCode("");
        setExpiresTime(null);
      }
    }
  }, [initialVerificationExpires]);

  useEffect(() => {
    if (!expiresTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresTime - now;
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresTime]);

  const submitConnect = () => {
    const trimmed = handle.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await connectCodeforces(trimmed);
      if (res.success) {
        setPendingHandle(trimmed);
        setVerificationCode(res.code);
        setExpiresTime(Date.now() + 15 * 60 * 1000); // 15 mins
      } else {
        setError(res.error);
      }
    });
  };

  const checkVerification = () => {
    setError(null);
    startCheckTransition(async () => {
      const res = await checkCfVerification();
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

  // State 2: Verification Pending
  if (verificationCode && pendingHandle) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
            <p className="text-xs font-semibold text-slate-300">
              Verify Codeforces Ownership
            </p>
          </div>
          <p className="text-xs text-slate-400">
            To verify handle <span className="font-semibold text-accent">{pendingHandle}</span>:
          </p>
        </div>

        <div className="rounded-lg bg-[#0a0a0a] border border-white/5 p-3 flex flex-col gap-2">
          <div className="text-xs text-slate-400">
            Change your Codeforces First Name to:
          </div>
          <div className="text-lg font-mono font-bold text-center tracking-wider text-white select-all border border-dashed border-white/10 bg-white/5 rounded py-2">
            {verificationCode}
          </div>
          <div className="text-xs text-slate-400 text-center">
            Go to Codeforces &rarr; Profile &rarr; Edit &rarr; paste this as First Name
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={checkVerification}
            disabled={isChecking || timeLeft === "00:00"}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isChecking ? "Checking…" : "Check Verification"}
          </button>
          {timeLeft && (
            <span className="text-xs text-slate-500 font-mono">
              {timeLeft === "00:00" ? (
                <button
                  onClick={() => {
                    setPendingHandle("");
                    setVerificationCode("");
                    setExpiresTime(null);
                    setError(null);
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  Start over
                </button>
              ) : (
                `expires in ${timeLeft}`
              )}
            </span>
          )}
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

  // State 1: Disconnected / Start verification
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      <div className="flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
        <p className="text-xs font-semibold text-slate-300">
          Connect Codeforces to unlock your Daily Challenge &amp; streak
        </p>
      </div>

      {needsReverification && (
        <div className="text-xs text-amber-400 font-medium">
          Your connected handle ({legacyHandle}) needs re-verification to activate the daily challenge.
        </div>
      )}

      <div className="flex gap-2">
        <input
          id="cf-handle-input"
          type="text"
          placeholder="Your CF handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitConnect()}
          disabled={isPending}
          className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
        <button
          onClick={submitConnect}
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
