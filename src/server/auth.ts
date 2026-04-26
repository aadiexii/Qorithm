import { currentUser, auth as clerkAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema/auth";

export async function getCurrentSession() {
  const { userId: clerkUserId } = await clerkAuth();

  if (!clerkUserId) return null;

  // Check if user exists in local DB
  const [localUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId));

  if (localUser) {
    return { user: localUser };
  }

  // If not in local DB, fetch from Clerk and create
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const [newUser] = await db
    .insert(users)
    .values({
      clerkUserId,
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
      image: clerkUser.imageUrl,
    })
    .returning();

  return { user: newUser };
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session) return null;

  if (session.user.role !== "admin") return null;

  return session;
}
