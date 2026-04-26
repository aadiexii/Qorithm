import { redirect } from "next/navigation";

import { getCurrentSession } from "@/server/auth";
import { getCodeforcesHandle } from "@/features/codeforces/actions";
import { CfSyncPanel } from "@/features/codeforces/components/cf-sync-panel";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  const cfHandle = await getCodeforcesHandle();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>
        <p className="text-muted-foreground">
          Configure integrations and sync preferences.
        </p>
      </div>

      <CfSyncPanel initialHandle={cfHandle} />
    </div>
  );
}
