import "server-only";

import { TAGS_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";

/**
 * @param {string} userId
 */
export async function deleteAllTagsForUser(userId) {
  const db = await getDb();
  const result = await db.collection(TAGS_COLLECTION).deleteMany({ userId });
  return result.deletedCount;
}
