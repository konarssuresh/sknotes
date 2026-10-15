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

/**
 * @param {string} userId
 * @param {Record<string, unknown>} document
 */
export async function insertNote(userId, document) {
  const db = await getDb();
  const result = await db.collection(NOTES_COLLECTION).insertOne({
    ...document,
    userId,
  });
  const { ObjectId } = await import("mongodb");
  const inserted = await db.collection(NOTES_COLLECTION).findOne({
    _id: result.insertedId,
    userId,
  });
  return inserted;
}

/**
 * @param {{ userId: string; noteId: string; expectedRevision: number; update: Record<string, unknown> }} params
 */
export async function updateNoteForUser({
  userId,
  noteId,
  expectedRevision,
  update,
}) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(noteId);
  } catch {
    return { ok: false, reason: "missing" };
  }

  const existing = await db.collection(NOTES_COLLECTION).findOne({ _id: id });
  if (!existing) {
    return { ok: false, reason: "missing" };
  }
  if (existing.userId !== userId) {
    return { ok: false, reason: "missing" };
  }
  if (existing.revision !== expectedRevision) {
    return { ok: false, reason: "stale", note: existing };
  }

  const now = new Date();
  const result = await db.collection(NOTES_COLLECTION).findOneAndUpdate(
    { _id: id, userId, revision: expectedRevision },
    {
      $set: { ...update, updatedAt: now },
      $inc: { revision: 1 },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    const current = await db.collection(NOTES_COLLECTION).findOne({
      _id: id,
      userId,
    });
    if (current && current.revision !== expectedRevision) {
      return { ok: false, reason: "stale", note: current };
    }
    return { ok: false, reason: "missing" };
  }

  return { ok: true, note: result };
}

/**
 * @param {{ userId: string; status: string; limit: number }} params
 */
export async function listNotesForUser({ userId, status, limit }) {
  const db = await getDb();
  return db
    .collection(NOTES_COLLECTION)
    .find({ userId, status })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit)
    .toArray();
}
