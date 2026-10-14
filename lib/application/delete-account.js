import "server-only";

import { deleteAllNotesForUser } from "@/lib/repositories/notes-repository";
import { deleteAllTagsForUser } from "@/lib/repositories/tags-repository";

/**
 * Removes application-owned data for a user. Auth records are removed by Better Auth.
 * @param {string} userId
 */
export async function deleteApplicationDataForUser(userId) {
  if (!userId) {
    throw new Error("userId is required for account data deletion");
  }
  await deleteAllNotesForUser(userId);
  await deleteAllTagsForUser(userId);
}

/**
 * Phase 5 contract: client recovery data must be keyed by stable userId
 * (e.g. IndexedDB database name `sknotes-recovery-${userId}`) and cleared
 * after successful account deletion on the client.
 */
export const CLIENT_RECOVERY_DB_PREFIX = "sknotes-recovery-";

export function getClientRecoveryDatabaseName(userId) {
  return `${CLIENT_RECOVERY_DB_PREFIX}${userId}`;
}
