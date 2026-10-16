import "server-only";

import { assertNoteContentEditable } from "@/lib/domain/notes/lifecycle";
import { assertValidStatusTransition } from "@/lib/domain/notes/status-transitions";
import { validateLexicalContent } from "@/lib/domain/notes/lexical-validate";
import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toNoteConflictDto, toNoteDto } from "@/lib/notes/note-dto";
import {
  findNoteForUser,
  updateNoteForUser,
} from "@/lib/repositories/notes-repository";
import { countOwnedTags } from "@/lib/repositories/tags-repository";

/**
 * @param {string} userId
 * @param {string} noteId
 * @param {{
 *   expectedRevision: number;
 *   title?: string;
 *   content?: unknown;
 *   pinned?: boolean;
 *   tagIds?: string[];
 *   status?: string;
 * }} input
 */
export async function updateNote(userId, noteId, input) {
  const existing = await findNoteForUser(userId, noteId);
  if (!existing) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Note not found", 404);
  }

  const hasContentChange =
    input.title !== undefined || input.content !== undefined;
  const hasMetaChange =
    input.pinned !== undefined ||
    input.tagIds !== undefined ||
    input.status !== undefined;

  if (existing.status === "trashed") {
    const onlyRestore =
      input.status === "active" &&
      input.title === undefined &&
      input.content === undefined &&
      input.pinned === undefined &&
      input.tagIds === undefined;
    if (!onlyRestore) {
      throw new ApiError(
        ErrorCodes.FORBIDDEN,
        "Trashed notes are read-only. Restore the note to edit it.",
        403,
        { reason: "NOTE_TRASHED" }
      );
    }
  } else if (hasContentChange) {
    assertNoteContentEditable(existing.status);
  }

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

  if (input.pinned !== undefined) {
    update.pinned = input.pinned;
  }

  if (input.tagIds !== undefined) {
    const uniqueIds = [...new Set(input.tagIds)];
    const ownedCount = await countOwnedTags(userId, uniqueIds);
    if (ownedCount !== uniqueIds.length) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        "One or more tags are invalid.",
        400
      );
    }
    update.tagIds = uniqueIds;
  }

  if (input.status !== undefined) {
    assertValidStatusTransition(existing.status, input.status);
    update.status = input.status;
  }

  if (!hasContentChange && !hasMetaChange && Object.keys(update).length === 0) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "No changes to apply.",
      400
    );
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
