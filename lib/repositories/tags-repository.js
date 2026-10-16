import "server-only";

import { TAGS_COLLECTION, NOTES_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";

/**
 * @param {string} userId
 */
export async function deleteAllTagsForUser(userId) {
  const db = await getDb();
  const result = await db.collection(TAGS_COLLECTION).deleteMany({ userId });
  return result.deletedCount;
}

/**
 * @param {string} userId
 * @param {string} tagId
 */
export async function findTagForUser(userId, tagId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(tagId);
  } catch {
    return null;
  }
  return db.collection(TAGS_COLLECTION).findOne({ _id: id, userId });
}

/**
 * @param {string} userId
 * @param {string} normalizedName
 */
export async function findTagByNormalizedName(userId, normalizedName) {
  const db = await getDb();
  return db.collection(TAGS_COLLECTION).findOne({ userId, normalizedName });
}

/**
 * @param {string} userId
 * @param {{ name: string; normalizedName: string }} fields
 */
export async function insertTag(userId, fields) {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection(TAGS_COLLECTION).insertOne({
    userId,
    name: fields.name,
    normalizedName: fields.normalizedName,
    createdAt: now,
    updatedAt: now,
  });
  const { ObjectId } = await import("mongodb");
  return db.collection(TAGS_COLLECTION).findOne({
    _id: result.insertedId,
    userId,
  });
}

/**
 * @param {string} userId
 * @param {string} tagId
 * @param {{ name: string; normalizedName: string }} fields
 */
export async function renameTagForUser(userId, tagId, fields) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(tagId);
  } catch {
    return null;
  }
  const now = new Date();
  const result = await db.collection(TAGS_COLLECTION).findOneAndUpdate(
    { _id: id, userId },
    {
      $set: {
        name: fields.name,
        normalizedName: fields.normalizedName,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );
  return result;
}

/**
 * @param {string} userId
 * @param {string} tagId
 */
export async function deleteTagForUser(userId, tagId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  let id;
  try {
    id = new ObjectId(tagId);
  } catch {
    return { ok: false, reason: "missing" };
  }

  const existing = await db.collection(TAGS_COLLECTION).findOne({
    _id: id,
    userId,
  });
  if (!existing) {
    return { ok: false, reason: "missing" };
  }

  await db
    .collection(NOTES_COLLECTION)
    .updateMany({ userId, tagIds: tagId }, { $pull: { tagIds: tagId } });
  await db.collection(TAGS_COLLECTION).deleteOne({ _id: id, userId });
  return { ok: true };
}

/**
 * @param {string} userId
 */
export async function listTagsWithNoteCounts(userId) {
  const db = await getDb();
  const tags = await db
    .collection(TAGS_COLLECTION)
    .find({ userId })
    .sort({ name: 1 })
    .toArray();

  const counts = await db
    .collection(NOTES_COLLECTION)
    .aggregate([
      { $match: { userId, status: "active" } },
      { $unwind: "$tagIds" },
      { $group: { _id: "$tagIds", count: { $sum: 1 } } },
    ])
    .toArray();

  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));

  return tags.map((tag) => {
    const id = tag._id.toString();
    return { tag, noteCount: countMap.get(id) ?? 0 };
  });
}

/**
 * @param {string} userId
 * @param {string[]} tagIds
 */
export async function countOwnedTags(userId, tagIds) {
  if (tagIds.length === 0) {
    return 0;
  }
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const ids = [];
  for (const tagId of tagIds) {
    try {
      ids.push(new ObjectId(tagId));
    } catch {
      return -1;
    }
  }
  return db.collection(TAGS_COLLECTION).countDocuments({
    userId,
    _id: { $in: ids },
  });
}
