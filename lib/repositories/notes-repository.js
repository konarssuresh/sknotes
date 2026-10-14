import "server-only";

import { NOTES_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";

/**
 * @param {string} userId
 */
export async function deleteAllNotesForUser(userId) {
  const db = await getDb();
  const result = await db.collection(NOTES_COLLECTION).deleteMany({ userId });
  return result.deletedCount;
}

/**
 * @param {string} userId
 * @param {string} noteId
 */
export async function findNoteForUser(userId, noteId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(noteId);
  } catch {
    return null;
  }
  return db.collection(NOTES_COLLECTION).findOne({ _id: id, userId });
}
