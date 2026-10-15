import "server-only";

import { assertNoteContentEditable } from "@/lib/domain/notes/lifecycle";
import { validateLexicalContent } from "@/lib/domain/notes/lexical-validate";
import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toNoteConflictDto, toNoteDto } from "@/lib/notes/note-dto";
import {
  findNoteForUser,
  updateNoteForUser,
} from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {string} noteId
 * @param {{ expectedRevision: number; title?: string; content?: unknown }} input
 */
export async function updateNote(userId, noteId, input) {
  const existing = await findNoteForUser(userId, noteId);
  if (!existing) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Note not found", 404);
  }

  assertNoteContentEditable(existing.status);

  const update = /** @type {Record<string, unknown>} */ ({});
  if (input.title !== undefined) {
    update.title = input.title;
  }
  if (input.content !== undefined) {
    const validatedContent = validateLexicalContent(input.content);
    update.content = validatedContent;
    update.plainText = plainTextFromLexical(validatedContent);
  } else if (input.title !== undefined) {
    update.plainText = plainTextFromLexical(existing.content);
  }

  const result = await updateNoteForUser({
    userId,
    noteId,
    expectedRevision: input.expectedRevision,
    update,
  });

  if (result.ok) {
    return toNoteDto(result.note);
  }

  if (result.reason === "stale" && result.note) {
    throw new ApiError(
      ErrorCodes.CONFLICT,
      "This note was updated elsewhere. Choose which version to keep.",
      409,
      {
        serverNote: toNoteConflictDto(result.note),
        currentRevision: result.note.revision,
      }
    );
  }

  throw new ApiError(ErrorCodes.NOT_FOUND, "Note not found", 404);
}
