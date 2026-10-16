import "server-only";

import { toNoteDto } from "@/lib/notes/note-dto";
import { searchNotes as searchNotesAdapter } from "@/lib/search/search-notes";

/**
 * @param {string} userId
 * @param {{
 *   q: string;
 *   status: string;
 *   tagId?: string | null;
 *   cursor?: string | null;
 *   limit: number;
 * }} query
 */
export async function searchNotes(userId, query) {
  const result = await searchNotesAdapter({
    userId,
    status: query.status,
    q: query.q,
    tagId: query.tagId ?? null,
    cursor: query.cursor ?? null,
    limit: query.limit,
  });
  return {
    notes: result.notes.map((doc) => toNoteDto(doc)),
    nextCursor: result.nextCursor,
  };
}
