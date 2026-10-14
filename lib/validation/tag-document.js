import { z } from "zod";

export const tagDocumentSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  normalizedName: z.string().min(1).max(100),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const tagDocumentInsertSchema = tagDocumentSchema.omit({
  createdAt: true,
  updatedAt: true,
});
