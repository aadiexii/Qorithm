"use server";

import { db } from "@/services/Database/client";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users } from "@/services/Database/schema/auth";
import { getCurrentSession } from "@/services/Auth/auth";
import { CodeforcesAdapter } from "@/services/Platforms";

export async function connectCodeforces(
  rawHandle: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const handle = rawHandle.trim();
  if (!handle) return { success: false, error: "Handle cannot be empty." };

  try {
    const profile = await CodeforcesAdapter.fetchProfile(handle);

    await db
      .update(users)
      .set({ codeforcesHandle: profile.handle })
      .where(eq(users.id, session.user.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect";
    return { success: false, error: message };
  }
}

export async function disconnectCodeforces(): Promise<{ success: true }> {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ codeforcesHandle: null })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}
