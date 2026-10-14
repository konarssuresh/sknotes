import { z } from "zod";

export const NOTE_STATUSES = ["active", "archived", "trashed"];

export const noteDocumentSchema = z.object({
  userId: z.string().min(1),
  title: z.string().max(10_000).default(""),
  content: z.unknown(),
  contentVersion: z.number().int().nonnegative().default(1),
  plainText: z.string().max(500_000).default(""),
  tagIds: z.array(z.string().min(1)).default([]),
  pinned: z.boolean().default(false),
  status: z.enum(NOTE_STATUSES).default("active"),
  revision: z.number().int().positive().default(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const noteDocumentInsertSchema = noteDocumentSchema.omit({
  createdAt: true,
  updatedAt: true,
});
