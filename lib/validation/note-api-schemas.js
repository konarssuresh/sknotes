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
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one of title or content is required",
  });

export const listNotesQuerySchema = z.object({
  status: z.enum(NOTE_STATUSES).default("active"),
  limit: z.coerce.number().int().min(1).max(30).default(30),
});

export const exportNoteQuerySchema = z.object({
  format: z.enum(["markdown", "text"]),
});
