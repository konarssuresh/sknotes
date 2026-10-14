import { z } from "zod";

export const sampleProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Enter a valid email address"),
});
