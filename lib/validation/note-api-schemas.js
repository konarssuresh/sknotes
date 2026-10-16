import { z } from "zod";

import { NOTE_STATUSES } from "@/lib/validation/note-document";

export const createNoteBodySchema = z.object({
  title: z.string().max(10_000).default(""),
  content: z.unknown(),
  forceCreate: z.boolean().optional().default(false),
});

export const updateNoteBodySchema = z
  .object({
    expectedRevision: z.number().int().positive(),
    title: z.string().max(10_000).optional(),
    content: z.unknown().optional(),
    pinned: z.boolean().optional(),
    tagIds: z.array(z.string().min(1)).max(50).optional(),
    status: z.enum(NOTE_STATUSES).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.pinned !== undefined ||
      data.tagIds !== undefined ||
      data.status !== undefined,
    { message: "At least one updatable field is required" }
  );

export const listNotesQuerySchema = z.object({
  status: z.enum(NOTE_STATUSES).default("active"),
  limit: z.coerce.number().int().min(1).max(30).default(30),
  cursor: z.string().min(1).optional().nullable(),
  tagId: z.string().min(1).optional().nullable(),
  pinned: z
    .enum(["true", "false"])
    .optional()
    .nullable()
    .transform((value) =>
      value === "true" ? true : value === "false" ? false : null
    ),
});

export const exportNoteQuerySchema = z.object({
  format: z.enum(["markdown", "text"]),
});
