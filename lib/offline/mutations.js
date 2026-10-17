import { openUserOfflineDb } from "./db";
import { OFFLINE_STORES } from "./constants";

/**
 * @param {string} userId
 */
export async function listPendingMutations(userId) {
  const db = await openUserOfflineDb(userId);
  const all = await db.getAll(OFFLINE_STORES.mutations);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * @param {string} userId
 */
export async function countPendingMutations(userId) {
  const db = await openUserOfflineDb(userId);
  return db.count(OFFLINE_STORES.mutations);
}

/**
 * @param {string} userId
 * @param {string} noteId
 */
async function removeMutationsForNote(userId, noteId) {
  const db = await openUserOfflineDb(userId);
  const tx = db.transaction(OFFLINE_STORES.mutations, "readwrite");
  const index = tx.store.index("byNoteId");
  const keys = await index.getAllKeys(noteId);
  for (const key of keys) {
    await tx.store.delete(key);
  }
  await tx.done;
}

/**
 * @param {string} userId
 * @param {import("./constants").OfflineMutationRecord} record
 */
export async function upsertPendingMutation(userId, record) {
  const db = await openUserOfflineDb(userId);
  await removeMutationsForNote(userId, record.noteId);
  await db.add(OFFLINE_STORES.mutations, {
    ...record,
    attempts: record.attempts ?? 0,
    createdAt: record.createdAt ?? new Date().toISOString(),
  });
}

/**
 * @param {string} userId
 * @param {number} id
 * @param {Partial<import("./constants").OfflineMutationRecord>} patch
 */
export async function updatePendingMutation(userId, id, patch) {
  const db = await openUserOfflineDb(userId);
  const existing = await db.get(OFFLINE_STORES.mutations, id);
  if (!existing) {
    return;
  }
  await db.put(OFFLINE_STORES.mutations, { ...existing, ...patch });
}

/**
 * @param {string} userId
 * @param {number} id
 */
export async function deletePendingMutation(userId, id) {
  const db = await openUserOfflineDb(userId);
  await db.delete(OFFLINE_STORES.mutations, id);
}

/**
 * @param {string} userId
 */
export async function clearAllPendingMutations(userId) {
  const db = await openUserOfflineDb(userId);
  await db.clear(OFFLINE_STORES.mutations);
}
