import { z } from "zod";

const authBaseSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signInSchema = authBaseSchema;

export const signUpSchema = authBaseSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});
