import "server-only";

import { toTagDto } from "@/lib/notes/tag-dto";
import { listTagsWithNoteCounts } from "@/lib/repositories/tags-repository";

/**
 * @param {string} userId
 */
export async function listTags(userId) {
  const rows = await listTagsWithNoteCounts(userId);
  return rows.map(({ tag, noteCount }) => toTagDto(tag, noteCount));
}
