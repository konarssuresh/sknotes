import { z } from "zod";

import { NOTE_STATUSES } from "@/lib/validation/note-document";

export const searchNotesQuerySchema = z.object({
  q: z.string().max(500).default(""),
  status: z.enum(NOTE_STATUSES).default("active"),
  tagId: z.string().min(1).optional().nullable(),
  cursor: z.string().min(1).optional().nullable(),
  limit: z.coerce.number().int().min(1).max(30).default(30),
});
