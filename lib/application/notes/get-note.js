import "server-only";

import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toNoteDto } from "@/lib/notes/note-dto";
import { findNoteForUser } from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {string} noteId
 */
export async function getNote(userId, noteId) {
  const note = await findNoteForUser(userId, noteId);
  if (!note) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Note not found", 404);
  }
  return toNoteDto(note);
}
