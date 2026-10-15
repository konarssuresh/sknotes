import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";

/**
 * @param {{ title?: string; content?: unknown }} fields
 */
export function hasMeaningfulContent({ title, content }) {
  if ((title ?? "").trim().length > 0) {
    return true;
  }
  return plainTextFromLexical(content).trim().length > 0;
}
