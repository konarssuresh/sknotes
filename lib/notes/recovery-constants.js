/** User-scoped recovery storage prefix (localStorage Phase 4; IndexedDB in Phase 6). */
export const CLIENT_RECOVERY_DB_PREFIX = "sknotes-recovery-";

/**
 * @param {string} userId
 */
export function getClientRecoveryDatabaseName(userId) {
  return `${CLIENT_RECOVERY_DB_PREFIX}${userId}`;
}
