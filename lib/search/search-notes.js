import "server-only";

import { NOTES_COLLECTION, TAGS_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import { decodeNoteCursor, encodeNoteCursor } from "@/lib/notes/cursor";

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {{
 *   userId: string;
 *   status: string;
 *   q: string;
 *   tagId?: string | null;
 *   cursor?: string | null;
 *   limit: number;
 * }} params
 */
export async function searchNotes({
  userId,
  status,
  q,
  tagId = null,
  cursor = null,
  limit,
}) {
  const trimmed = q.trim();
  if (!trimmed) {
    const { listNotesForUser } =
      await import("@/lib/repositories/notes-repository");
    return listNotesForUser({
      userId,
      status,
      limit,
      cursor,
      tagId,
    });
  }

  const db = await getDb();
  const pageSize = Math.min(Math.max(limit, 1), 30);
  const regex = new RegExp(escapeRegExp(trimmed), "i");

  const matchingTags = await db
    .collection(TAGS_COLLECTION)
    .find({ userId, normalizedName: regex })
    .project({ _id: 1 })
    .toArray();
  const matchingTagIds = matchingTags.map((tag) => tag._id.toString());

  /** @type {import('mongodb').Filter<import('mongodb').Document>} */
  const orClauses = [{ title: regex }, { plainText: regex }];
  if (matchingTagIds.length > 0) {
    orClauses.push({ tagIds: { $in: matchingTagIds } });
  }

  /** @type {import('mongodb').Filter<import('mongodb').Document>} */
  let filter = {
    userId,
    status,
    $or: orClauses,
  };
  if (tagId) {
    filter.tagIds = tagId;
  }

  if (cursor) {
    const decoded = decodeNoteCursor(cursor);
    const { ObjectId } = await import("mongodb");
    let objectId;
    try {
      objectId = new ObjectId(decoded.id);
    } catch {
      throw new Error("Invalid cursor");
    }
    filter = {
      ...filter,
      $and: [
        {
          $or: [
            { updatedAt: { $lt: decoded.updatedAt } },
            { updatedAt: decoded.updatedAt, _id: { $lt: objectId } },
          ],
        },
      ],
    };
  }

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
