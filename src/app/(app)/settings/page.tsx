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
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.28em] uppercase">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Account settings
        </h1>
        <p className="text-muted-foreground">
          Configure your Codeforces integration for personalized daily
          challenges.
        </p>
      </div>

      <div className="max-w-2xl">
        <PlatformConnections codeforcesHandle={user.codeforcesHandle} />
      </div>
    </div>
  );
}
