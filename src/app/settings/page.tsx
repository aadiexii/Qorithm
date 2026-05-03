import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { getCurrentSession } from "@/server/auth";
import { PlatformConnections } from "@/features/dashboard/components/platform-connections";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

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

      <div className="max-w-2xl">
        <PlatformConnections 
          codeforces={{ handle: user.codeforcesHandle, lastSync: user.codeforcesLastSyncAt }}
          atcoder={{ handle: user.atcoderHandle, lastSync: user.atcoderLastSyncAt }}
        />
      </div>

    </div>
  );
}
