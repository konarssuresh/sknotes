export const OFFLINE_DB_VERSION = 1;

export const OFFLINE_STORES = {
  drafts: "drafts",
  mutations: "mutations",
};

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
