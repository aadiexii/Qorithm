import { z } from "zod";

export const adminCreateProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source: z.string().min(1, "Source is required"),
  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .positive("Rating must be positive")
    .optional()
    .or(z.literal("")),
  platform: z.enum(["custom", "codeforces", "atcoder"]).default("custom"),
  externalContestId: z.coerce.number().int().positive().optional().or(z.literal("")),
  externalProblemIndex: z.string().optional().default(""),
  isPublished: z.coerce.boolean().default(false),
  topicIds: z.array(z.string()).optional().default([]),
});

export type AdminCreateProblemInput = z.infer<typeof adminCreateProblemSchema>;

export const adminUpdateProblemSchema = adminCreateProblemSchema.extend({
  id: z.string().uuid("Invalid problem ID"),
});

export type AdminUpdateProblemInput = z.infer<typeof adminUpdateProblemSchema>;

export const bulkImportRowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source: z.string().min(1, "Source is required"),
  rating: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal("")),
  platform: z
    .enum(["custom", "codeforces", "atcoder"])
    .optional()
    .default("custom"),
  externalContestId: z.coerce.number().int().positive().optional().or(z.literal("")),
  externalProblemIndex: z.string().optional().default(""),
  topics: z.string().optional().default(""),
  isPublished: z
    .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0"), z.literal("")])
    .optional()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
});

export type BulkImportRowInput = z.infer<typeof bulkImportRowSchema>;
