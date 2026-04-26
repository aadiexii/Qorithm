import { z } from "zod";

export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source: z.string().min(1, "Source is required"),
  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .positive("Rating must be positive")
    .optional()
    .or(z.literal("")),
  topicIds: z.array(z.string()).optional().default([]),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;

export const updateProblemSchema = createProblemSchema.extend({
  id: z.string().uuid("Invalid problem ID"),
});

export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
