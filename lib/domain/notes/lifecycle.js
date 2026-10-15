import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/**
 * Content/title edits allowed for active and archived notes; trashed is read-only.
 * @param {string} status
 */
export function assertNoteContentEditable(status) {
  if (status === "trashed") {
    throw new ApiError(
      ErrorCodes.FORBIDDEN,
      "Trashed notes are read-only. Restore the note to edit it.",
      403,
      { reason: "NOTE_TRASHED" }
    );
  }
}

/**
 * @param {string} status
 */
export function canEditNoteContent(status) {
  return status === "active" || status === "archived";
}
