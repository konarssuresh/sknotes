import "server-only";

import { NOTES_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import { decodeNoteCursor, encodeNoteCursor } from "@/lib/notes/cursor";

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
 * @param {import('mongodb').Filter<import('mongodb').Document>} filter
 * @param {{ updatedAt: Date; id: string }} cursor
 */
async function withCursorFilter(filter, cursor) {
  const { ObjectId } = await import("mongodb");
  let objectId;
  try {
    objectId = new ObjectId(cursor.id);
  } catch {
    throw new Error("Invalid cursor");
  }
  return {
    ...filter,
    $or: [
      { updatedAt: { $lt: cursor.updatedAt } },
      { updatedAt: cursor.updatedAt, _id: { $lt: objectId } },
    ],
  };
}

/**
 * @param {{
 *   userId: string;
 *   status: string;
 *   limit: number;
 *   cursor?: string | null;
 *   tagId?: string | null;
 *   pinned?: boolean | null;
 * }} params
 */
export async function listNotesForUser({
  userId,
  status,
  limit,
  cursor = null,
  tagId = null,
  pinned = null,
}) {
  const db = await getDb();
  /** @type {import('mongodb').Filter<import('mongodb').Document>} */
  let filter = { userId, status };
  if (tagId) {
    filter.tagIds = tagId;
  }
  if (pinned === true) {
    filter.pinned = true;
  }
  if (cursor) {
    filter = await withCursorFilter(filter, decodeNoteCursor(cursor));
  }

  const pageSize = Math.min(Math.max(limit, 1), 30);
  const docs = await db
    .collection(NOTES_COLLECTION)
    .find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(pageSize + 1)
    .toArray();

  const hasMore = docs.length > pageSize;
  const notes = hasMore ? docs.slice(0, pageSize) : docs;
  const last = notes[notes.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeNoteCursor({
          updatedAt: last.updatedAt,
          id: last._id.toString(),
        })
      : null;

  return { notes, nextCursor };
}

/**
 * @param {string} userId
 * @param {string} noteId
 */
export async function permanentlyDeleteNoteForUser(userId, noteId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(noteId);
  } catch {
    return { ok: false, reason: "missing" };
  }

  const existing = await db.collection(NOTES_COLLECTION).findOne({
    _id: id,
    userId,
  });
  if (!existing) {
    return { ok: false, reason: "missing" };
  }
  if (existing.status !== "trashed") {
    return { ok: false, reason: "not_trashed" };
  }

  const result = await db.collection(NOTES_COLLECTION).deleteOne({
    _id: id,
    userId,
    status: "trashed",
  });
  return { ok: result.deletedCount === 1 };
}

/**
 * @param {string} userId
 * @param {string} status
 */
export async function countNotesForUserByStatus(userId, status) {
  const db = await getDb();
  return db.collection(NOTES_COLLECTION).countDocuments({ userId, status });
}
