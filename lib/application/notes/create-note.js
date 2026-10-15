import "server-only";

import { createNoteDefaults } from "@/lib/domain/notes/defaults";
import { validateLexicalContent } from "@/lib/domain/notes/lexical-validate";
import { hasMeaningfulContent } from "@/lib/domain/notes/meaningful-content";
import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toNoteDto } from "@/lib/notes/note-dto";
import { insertNote } from "@/lib/repositories/notes-repository";

/**
 * @param {string} userId
 * @param {{ title: string; content: unknown; forceCreate?: boolean }} input
 */
export async function createNote(userId, input) {
  const validatedContent = validateLexicalContent(input.content);
  const title = input.title ?? "";

  if (
    !input.forceCreate &&
    !hasMeaningfulContent({ title, content: validatedContent })
  ) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Note must have a title or body before it can be saved",
      400,
      { reason: "EMPTY_NOTE" }
    );
  }

  const plainText = plainTextFromLexical(validatedContent);
  const defaults = createNoteDefaults(userId, {
    title,
    content: validatedContent,
  });

  const note = await insertNote(userId, {
    ...defaults,
    plainText,
  });

  return toNoteDto(note);
}
