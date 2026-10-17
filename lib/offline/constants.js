export const OFFLINE_DB_VERSION = 2;

export const OFFLINE_STORES = {
  drafts: "drafts",
  mutations: "mutations",
  readCache: "readCache",
};

export const READ_CACHE_MAX_ENTRIES = 60;
export const READ_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** @typedef {"create" | "update"} OfflineMutationOp */

/**
 * @typedef {{
 *   id?: number;
 *   noteId: string;
 *   op: OfflineMutationOp;
 *   title: string;
 *   content: unknown;
 *   expectedRevision: number | null;
 *   fingerprint: string;
 *   createdAt: string;
 *   attempts: number;
 *   lastError?: string | null;
 *   blockedConflict?: boolean;
 * }} OfflineMutationRecord
 */

/**
 * @typedef {{
 *   draftKey: string;
 *   title: string;
 *   content: unknown;
 *   savedAt: string;
 * }} OfflineDraftRecord
 */

export const MAX_SYNC_ATTEMPTS = 8;
export const SYNC_BASE_DELAY_MS = 1000;
export const SYNC_MAX_DELAY_MS = 60_000;
