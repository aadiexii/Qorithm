"use server";

import { db } from "@/services/Database/client";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users } from "@/services/Database/schema/auth";
import { getCurrentSession } from "@/services/Auth/auth";
import { CodeforcesAdapter } from "@/services/Platforms";

function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "Qorithm-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function connectCodeforces(
  rawHandle: string,
): Promise<{ success: true; code: string } | { success: false; error: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const now = new Date();
  if (session.user.lastVerificationRequestAt) {
    const diffMs = now.getTime() - new Date(session.user.lastVerificationRequestAt).getTime();
    if (diffMs < 60000) {
      return { success: false, error: "Please wait before requesting a new code" };
    }
  }

  const handle = rawHandle.trim();
  if (!handle) return { success: false, error: "Handle cannot be empty." };

  try {
    const profile = await CodeforcesAdapter.fetchProfile(handle);
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db
      .update(users)
      .set({
        cfPendingHandle: profile.handle,
        cfVerificationCode: code,
        cfVerificationExpires: expiresAt,
        lastVerificationRequestAt: now,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, code };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect";
    return { success: false, error: message };
  }
}

export async function checkCfVerification(): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "You must be signed in." };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || !user.cfPendingHandle || !user.cfVerificationCode || !user.cfVerificationExpires) {
    return { success: false, error: "No pending verification found." };
  }

  const now = new Date();
  if (now > new Date(user.cfVerificationExpires)) {
    await db
      .update(users)
      .set({
        cfPendingHandle: null,
        cfVerificationCode: null,
        cfVerificationExpires: null,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: false, error: "Verification code expired. Start again." };
  }

  try {
    const profile = await CodeforcesAdapter.fetchProfile(user.cfPendingHandle);
    const firstName = profile.firstName;

    if (firstName && firstName.trim() === user.cfVerificationCode) {
      await db
        .update(users)
        .set({
          codeforcesHandle: user.cfPendingHandle,
          cfVerificationCode: "VERIFIED",
          cfPendingHandle: null,
          cfVerificationExpires: null,
        })
        .where(eq(users.id, session.user.id));

      revalidatePath("/settings");
      revalidatePath("/dashboard");

      return { success: true };
    }

    return {
      success: false,
      error: "Verification code not found. Make sure you changed your CF First Name to the code shown.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return { success: false, error: message };
  }
}

export async function disconnectCodeforces(): Promise<{ success: true }> {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      codeforcesHandle: null,
      cfVerificationCode: null,
      cfPendingHandle: null,
      cfVerificationExpires: null,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}
