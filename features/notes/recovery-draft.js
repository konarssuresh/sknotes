import { CLIENT_RECOVERY_DB_PREFIX } from "@/lib/notes/recovery-constants";

const STORAGE_SUFFIX = "draft-v1";

/**
 * @param {string} userId
 */
export function getRecoveryStorageKey(userId) {
  return `${CLIENT_RECOVERY_DB_PREFIX}${STORAGE_SUFFIX}:${userId}`;
}

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export function readRecoveryDraft(userId, draftKey) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(getRecoveryStorageKey(userId));
    if (!raw) {
      return null;
    }
    const map = JSON.parse(raw);
    return map[draftKey] ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {string} userId
 * @param {string} draftKey
 * @param {{ title: string; content: unknown; savedAt: string }} draft
 */
export function writeRecoveryDraft(userId, draftKey, draft) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key = getRecoveryStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[draftKey] = draft;
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export function clearRecoveryDraft(userId, draftKey) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key = getRecoveryStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return;
    }
    const map = JSON.parse(raw);
    delete map[draftKey];
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}
