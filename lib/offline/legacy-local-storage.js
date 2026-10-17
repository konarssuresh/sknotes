import { CLIENT_RECOVERY_DB_PREFIX } from "@/lib/notes/recovery-constants";

const LEGACY_STORAGE_SUFFIX = "draft-v1";

/**
 * @param {string} userId
 */
export function getLegacyRecoveryStorageKey(userId) {
  return `${CLIENT_RECOVERY_DB_PREFIX}${LEGACY_STORAGE_SUFFIX}:${userId}`;
}

/**
 * @param {string} userId
 * @returns {Record<string, { title: string; content: unknown; savedAt: string }> | null}
 */
export function readLegacyRecoveryMap(userId) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(
      getLegacyRecoveryStorageKey(userId)
    );
    if (!raw) {
      return null;
    }
    const map = JSON.parse(raw);
    return map && typeof map === "object" ? map : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} userId
 */
export function clearLegacyRecoveryStorage(userId) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(getLegacyRecoveryStorageKey(userId));
  } catch {
    // ignore
  }
}
