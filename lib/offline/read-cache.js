import {
  OFFLINE_STORES,
  READ_CACHE_MAX_ENTRIES,
  READ_CACHE_TTL_MS,
} from "./constants";
import { openUserOfflineDb } from "./db";

/**
 * @param {string} status
 * @param {string | null | undefined} tagId
 * @param {string | null | undefined} query
 */
export function buildNotesListCacheKey(status, tagId, query) {
  const tag = tagId ?? "";
  const q = query?.trim() ?? "";
  return `notes-list:${status}:${tag}:${q}`;
}

/**
 * @param {Array<{ cacheKey: string; savedAt: string }>} entries
 * @param {number} now
 */
export function pruneReadCacheEntries(entries, now = Date.now()) {
  const fresh = entries
    .filter((entry) => now - Date.parse(entry.savedAt) <= READ_CACHE_TTL_MS)
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  return fresh.slice(0, READ_CACHE_MAX_ENTRIES);
}

/**
 * @param {string} userId
 * @param {string} cacheKey
 * @param {unknown} payload
 */
export async function saveNotesListSnapshot(userId, cacheKey, payload) {
  if (!userId || typeof indexedDB === "undefined") {
    return;
  }
  const db = await openUserOfflineDb(userId);
  const savedAt = new Date().toISOString();
  await db.put(OFFLINE_STORES.readCache, {
    cacheKey,
    payload,
    savedAt,
  });

  const all = await db.getAll(OFFLINE_STORES.readCache);
  const pruned = pruneReadCacheEntries(all);
  const keepKeys = new Set(pruned.map((row) => row.cacheKey));
  for (const row of all) {
    if (!keepKeys.has(row.cacheKey)) {
      await db.delete(OFFLINE_STORES.readCache, row.cacheKey);
    }
  }
}

/**
 * @param {string} userId
 * @param {string} cacheKey
 */
export async function loadNotesListSnapshot(userId, cacheKey) {
  if (!userId || typeof indexedDB === "undefined") {
    return null;
  }
  const db = await openUserOfflineDb(userId);
  const row = await db.get(OFFLINE_STORES.readCache, cacheKey);
  if (!row?.payload) {
    return null;
  }
  if (Date.now() - Date.parse(row.savedAt) > READ_CACHE_TTL_MS) {
    await db.delete(OFFLINE_STORES.readCache, cacheKey);
    return null;
  }
  return row.payload;
}
