"use server";

import { and, count, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { problems, problemTopics } from "@/db/schema/problems";
import { requireAdmin } from "@/server/auth";
import { createProblemSchema, updateProblemSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type ProblemsFilter = {
  q?: string;
  topic?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  pageSize?: number;
};

export type PaginatedProblems = {
  items: Awaited<ReturnType<typeof queryProblems>>["items"];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Read – paginated + filtered
// ---------------------------------------------------------------------------

export async function queryProblems(filters: ProblemsFilter = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 10));
  const offset = (page - 1) * pageSize;

  // Build WHERE conditions
  const conditions: SQL[] = [];

  // Public query only shows published problems
  conditions.push(eq(problems.isPublished, true));

  if (filters.q) {
    const search = `%${filters.q}%`;
    conditions.push(or(ilike(problems.title, search), ilike(problems.source, search))!);
  }

  if (filters.minRating) {
    conditions.push(gte(problems.rating, filters.minRating));
  }

  if (filters.maxRating) {
    conditions.push(lte(problems.rating, filters.maxRating));
  }

  // Topic filter requires a subquery-like approach via the join table
  if (filters.topic) {
    const matchingProblemIds = await db
      .select({ problemId: problemTopics.problemId })
      .from(problemTopics)
      .where(eq(problemTopics.topicId, filters.topic));

    const ids = matchingProblemIds.map((r) => r.problemId);

    if (ids.length === 0) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Use OR chain for matching ids since drizzle `inArray` works well here
    const { inArray } = await import("drizzle-orm");
    conditions.push(inArray(problems.id, ids));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(problems)
    .where(whereClause);

  const total = totalResult?.value ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const items = await db.query.problems.findMany({
    where: whereClause,
    with: {
      problemTopics: {
        with: {
          topic: true,
        },
      },
    },
    orderBy: [desc(problems.createdAt)],
    limit: pageSize,
    offset,
  });

  return { items, total, page, pageSize, totalPages };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createProblemAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const topicIds = formData.getAll("topicIds").map(String);

  const parsed = createProblemSchema.safeParse({
    title: formData.get("title"),
    source: formData.get("source"),
    rating: formData.get("rating"),
    topicIds,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, source, rating, topicIds: validatedTopicIds } = parsed.data;

  try {
    const finalRating = typeof rating === "number" ? rating : null;

    await db.transaction(async (tx) => {
      const [newProblem] = await tx
        .insert(problems)
        .values({ title, source, rating: finalRating })
        .returning({ id: problems.id });

      if (validatedTopicIds && validatedTopicIds.length > 0) {
        await tx.insert(problemTopics).values(
          validatedTopicIds.map((topicId) => ({
            problemId: newProblem.id,
            topicId,
          })),
        );
      }
    });

    revalidatePath("/problems");
    revalidatePath("/dashboard");

    return { success: true, message: "Problem created successfully!" };
  } catch (error) {
    console.error("Failed to create problem:", error);
    return { success: false, message: "An unexpected error occurred while creating the problem." };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateProblemAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const topicIds = formData.getAll("topicIds").map(String);

  const parsed = updateProblemSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    source: formData.get("source"),
    rating: formData.get("rating"),
    topicIds,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, title, source, rating, topicIds: validatedTopicIds } = parsed.data;

  try {
    const finalRating = typeof rating === "number" ? rating : null;

    await db.transaction(async (tx) => {
      await tx
        .update(problems)
        .set({ title, source, rating: finalRating })
        .where(eq(problems.id, id));

      // Replace topic mappings: delete all then re-insert
      await tx.delete(problemTopics).where(eq(problemTopics.problemId, id));

      if (validatedTopicIds && validatedTopicIds.length > 0) {
        await tx.insert(problemTopics).values(
          validatedTopicIds.map((topicId) => ({
            problemId: id,
            topicId,
          })),
        );
      }
    });

    revalidatePath("/problems");
    revalidatePath("/dashboard");

    return { success: true, message: "Problem updated successfully!" };
  } catch (error) {
    console.error("Failed to update problem:", error);
    return { success: false, message: "An unexpected error occurred while updating the problem." };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteProblemAction(id: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  try {
    // FK cascade handles problem_topics cleanup
    await db.delete(problems).where(eq(problems.id, id));

    revalidatePath("/problems");
    revalidatePath("/dashboard");

    return { success: true, message: "Problem deleted." };
  } catch (error) {
    console.error("Failed to delete problem:", error);
    return { success: false, message: "An unexpected error occurred while deleting the problem." };
  }
}
