import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/services/Database/client";
import { users } from "@/services/Database/schema/auth";
import { getCurrentSession } from "@/services/Auth/auth";
import { PlatformConnections } from "@/components/dashboard/platform-connections";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your platform connections and account preferences.
        </p>
      </div>

      <div className="h-px bg-white/5" />

      <div className="max-w-md">
        <PlatformConnections codeforcesHandle={user.codeforcesHandle} />
      </div>
    </div>
  );
}
