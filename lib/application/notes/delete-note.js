import "server-only";

import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { permanentlyDeleteNoteForUser } from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {string} noteId
 */
export async function deleteNotePermanently(userId, noteId) {
  const result = await permanentlyDeleteNoteForUser(userId, noteId);
  if (!result.ok) {
    if (result.reason === "not_trashed") {
      throw new ApiError(
        ErrorCodes.FORBIDDEN,
        "Only trashed notes can be permanently deleted.",
        403,
        { reason: "NOTE_NOT_TRASHED" }
      );
    }
    throw new ApiError(ErrorCodes.NOT_FOUND, "Note not found", 404);
  }
}
