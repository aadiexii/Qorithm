import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(slugRegex, "Slug must be lowercase kebab-case (e.g. dynamic-programming)"),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = createTopicSchema.extend({
  id: z.string().uuid("Invalid topic ID"),
});

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
