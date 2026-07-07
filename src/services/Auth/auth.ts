import { currentUser, auth as clerkAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/services/Database/client";
import { users } from "@/services/Database/schema/auth";

const ADMIN_EMAILS = ["shayan@repovive.com"];

export async function getCurrentSession() {
  let clerkUserId: string | null = null;
  try {
    ({ userId: clerkUserId } = await clerkAuth());
  } catch {
    // Clerk can't detect usage (e.g. missing middleware context during static
    // generation or dev-server hiccups). Treat as unauthenticated.
    return null;
  }

  if (!clerkUserId) return null;

  // Check if user exists in local DB
  let [localUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId));

  if (localUser) {
    // Auto-promote to admin if email is in the list
    if (ADMIN_EMAILS.includes(localUser.email) && localUser.role !== "admin") {
      [localUser] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, localUser.id))
        .returning();
    }
    return { user: localUser };
  }

  // If not in local DB, fetch from Clerk and upsert.
  // Uses onConflictDoUpdate so that:
  //  • a stale dev-instance row (same email, old clerkUserId) gets reconciled
  //  • a race condition double-insert is silently collapsed into one row
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";
  const name =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
  const emailVerified =
    clerkUser.emailAddresses[0]?.verification?.status === "verified";

  const [upsertedUser] = await db
    .insert(users)
    .values({
      clerkUserId,
      email,
      name,
      emailVerified,
      image: clerkUser.imageUrl,
      role,
    })
    // Conflict on email: reconcile the clerkUserId (dev→prod migration case)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        clerkUserId,
        name,
        emailVerified,
        image: clerkUser.imageUrl,
        role,
        updatedAt: new Date(),
      },
    })
    .returning();

  return { user: upsertedUser };
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session) return null;

  if (session.user.role !== "admin") return null;

  return session;
}
