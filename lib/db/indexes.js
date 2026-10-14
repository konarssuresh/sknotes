import "server-only";

import { NOTES_COLLECTION, TAGS_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";

export async function ensureApplicationIndexes() {
  const db = await getDb();

  await db
    .collection(TAGS_COLLECTION)
    .createIndex(
      { userId: 1, normalizedName: 1 },
      { unique: true, name: "tags_user_normalizedName_unique" }
    );

  await db
    .collection(NOTES_COLLECTION)
    .createIndex(
      { userId: 1, status: 1, updatedAt: -1, _id: -1 },
      { name: "notes_user_status_updatedAt_id" }
    );

  await db
    .collection(NOTES_COLLECTION)
    .createIndex({ userId: 1, _id: 1 }, { name: "notes_user_id" });
}
