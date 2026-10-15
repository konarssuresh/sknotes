import "server-only";

import { toNoteDto } from "@/lib/notes/note-dto";
import { listNotesForUser } from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {{ status: string; limit: number }} query
 */
export async function listNotes(userId, query) {
  const notes = await listNotesForUser({
    userId,
    status: query.status,
    limit: query.limit,
  });
  return notes.map((doc) => toNoteDto(doc));
}
