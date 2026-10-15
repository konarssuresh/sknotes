import "server-only";

import {
  noteToMarkdownExport,
  noteToPlainTextExport,
} from "@/lib/domain/notes/export";
import { getNote } from "@/lib/application/notes/get-note";

/**
 * @param {string} userId
 * @param {string} noteId
 * @param {"markdown" | "text"} format
 */
export async function exportNote(userId, noteId, format) {
  const note = await getNote(userId, noteId);
  const body =
    format === "markdown"
      ? noteToMarkdownExport(note)
      : noteToPlainTextExport(note);

  const safeTitle = (note.title || "note")
    .replace(/[^\w\-]+/g, "-")
    .slice(0, 80);
  const extension = format === "markdown" ? "md" : "txt";
  const mime =
    format === "markdown"
      ? "text/markdown; charset=utf-8"
      : "text/plain; charset=utf-8";

  return {
    body,
    filename: `${safeTitle || "note"}.${extension}`,
    mime,
  };
}
