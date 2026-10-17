import { openDB } from "idb";

import { getClientRecoveryDatabaseName } from "@/lib/notes/recovery-constants";

import { OFFLINE_DB_VERSION, OFFLINE_STORES } from "./constants";

/** @type {Map<string, import("idb").IDBPDatabase>} */
const openConnections = new Map();

/**
 * @param {string} userId
 */
export async function openUserOfflineDb(userId) {
  const existing = openConnections.get(userId);
  if (existing) {
    return existing;
  }

  const name = getClientRecoveryDatabaseName(userId);
  const db = await openDB(name, OFFLINE_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(OFFLINE_STORES.drafts)) {
        db.createObjectStore(OFFLINE_STORES.drafts, { keyPath: "draftKey" });
      }
      if (!db.objectStoreNames.contains(OFFLINE_STORES.mutations)) {
        const store = db.createObjectStore(OFFLINE_STORES.mutations, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("byNoteId", "noteId");
        store.createIndex("byCreatedAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(OFFLINE_STORES.readCache)) {
        const store = db.createObjectStore(OFFLINE_STORES.readCache, {
          keyPath: "cacheKey",
        });
        store.createIndex("bySavedAt", "savedAt");
      }
    },
  });
  openConnections.set(userId, db);
  return db;
}

/**
 * @param {string} userId
 */
export async function closeUserOfflineDb(userId) {
  const db = openConnections.get(userId);
  if (!db) {
    return;
  }
  db.close();
  openConnections.delete(userId);
}

/**
 * @param {string} userId
 */
export async function deleteUserOfflineDatabase(userId) {
  if (typeof indexedDB === "undefined") {
    return;
  }
  await closeUserOfflineDb(userId);
  const name = getClientRecoveryDatabaseName(userId);
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve(undefined);
  });
}
