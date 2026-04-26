"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { problemTopics, topics } from "@/db/schema/problems";
import { requireAdmin } from "@/server/auth";
import { createTopicSchema, updateTopicSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Types (reuse ActionState shape from problems)
// ---------------------------------------------------------------------------

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type TopicWithCount = {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
};

// ---------------------------------------------------------------------------
// Read – list with usage counts
// ---------------------------------------------------------------------------

export async function queryTopics(): Promise<TopicWithCount[]> {
  const rows = await db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      usageCount: count(problemTopics.problemId),
    })
    .from(topics)
    .leftJoin(problemTopics, eq(topics.id, problemTopics.topicId))
    .groupBy(topics.id, topics.name, topics.slug)
    .orderBy(topics.name);

  return rows;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createTopicAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const parsed = createTopicSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db.insert(topics).values(parsed.data);

    revalidatePath("/admin/topics");
    revalidatePath("/problems");

    return { success: true, message: "Topic created successfully!" };
  } catch (error: unknown) {
    // Handle unique constraint violation on slug
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return {
        success: false,
        message: "A topic with that slug already exists.",
        errors: { slug: ["Slug must be unique."] },
      };
    }
    console.error("Failed to create topic:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateTopicAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const parsed = updateTopicSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db
      .update(topics)
      .set({ name: parsed.data.name, slug: parsed.data.slug })
      .where(eq(topics.id, parsed.data.id));

    revalidatePath("/admin/topics");
    revalidatePath("/problems");

    return { success: true, message: "Topic updated successfully!" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return {
        success: false,
        message: "A topic with that slug already exists.",
        errors: { slug: ["Slug must be unique."] },
      };
    }
    console.error("Failed to update topic:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteTopicAction(id: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  try {
    // FK cascade on problem_topics handles mapping cleanup.
    // Problems themselves are NOT deleted.
    await db.delete(topics).where(eq(topics.id, id));

    revalidatePath("/admin/topics");
    revalidatePath("/problems");

    return { success: true, message: "Topic deleted." };
  } catch (error) {
    console.error("Failed to delete topic:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
