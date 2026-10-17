import { openUserOfflineDb } from "./db";
import {
  clearLegacyRecoveryStorage,
  readLegacyRecoveryMap,
} from "./legacy-local-storage";
import { OFFLINE_STORES } from "./constants";

const migratedUsers = new Set();

/**
 * @param {string} userId
 */
async function ensureLegacyImport(userId) {
  if (migratedUsers.has(userId)) {
    return;
  }
  migratedUsers.add(userId);
  const legacy = readLegacyRecoveryMap(userId);
  if (!legacy) {
    return;
  }
  const db = await openUserOfflineDb(userId);
  const tx = db.transaction(OFFLINE_STORES.drafts, "readwrite");
  for (const [draftKey, draft] of Object.entries(legacy)) {
    if (!draft || typeof draft !== "object") {
      continue;
    }
    await tx.store.put({
      draftKey,
      title: draft.title ?? "",
      content: draft.content ?? null,
      savedAt: draft.savedAt ?? new Date().toISOString(),
    });
  }
  await tx.done;
  clearLegacyRecoveryStorage(userId);
}

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export async function readOfflineDraft(userId, draftKey) {
  if (!userId) {
    return null;
  }
  await ensureLegacyImport(userId);
  const db = await openUserOfflineDb(userId);
  const record = await db.get(OFFLINE_STORES.drafts, draftKey);
  if (!record) {
    return null;
  }
  return {
    title: record.title,
    content: record.content,
    savedAt: record.savedAt,
  };
}

/**
 * @param {string} userId
 * @param {string} draftKey
 * @param {{ title: string; content: unknown; savedAt: string }} draft
 */
export async function writeOfflineDraft(userId, draftKey, draft) {
  if (!userId || typeof window === "undefined") {
    return;
  }
  await ensureLegacyImport(userId);
  const db = await openUserOfflineDb(userId);
  await db.put(OFFLINE_STORES.drafts, {
    draftKey,
    title: draft.title,
    content: draft.content,
    savedAt: draft.savedAt,
  });
}

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export async function clearOfflineDraft(userId, draftKey) {
  if (!userId || typeof window === "undefined") {
    return;
  }
  const db = await openUserOfflineDb(userId);
  await db.delete(OFFLINE_STORES.drafts, draftKey);
}

/**
 * @param {string} userId
 */
export async function clearAllOfflineDrafts(userId) {
  if (!userId || typeof window === "undefined") {
    return;
  }
  const db = await openUserOfflineDb(userId);
  await db.clear(OFFLINE_STORES.drafts);
}
