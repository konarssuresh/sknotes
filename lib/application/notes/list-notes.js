import "server-only";

import { toNoteDto } from "@/lib/notes/note-dto";
import { listNotesForUser } from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {{
 *   status: string;
 *   limit: number;
 *   cursor?: string | null;
 *   tagId?: string | null;
 *   pinned?: boolean | null;
 * }} query
 */
export async function listNotes(userId, query) {
  const result = await listNotesForUser({
    userId,
    status: query.status,
    limit: query.limit,
    cursor: query.cursor ?? null,
    tagId: query.tagId ?? null,
    pinned: query.pinned ?? null,
  });
  return {
    notes: result.notes.map((doc) => toNoteDto(doc)),
    nextCursor: result.nextCursor,
  };
}
