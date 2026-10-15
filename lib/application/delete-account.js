import "server-only";

import {
  CLIENT_RECOVERY_DB_PREFIX,
  getClientRecoveryDatabaseName,
} from "@/lib/notes/recovery-constants";
import { deleteAllNotesForUser } from "@/lib/repositories/notes-repository";
import { deleteAllTagsForUser } from "@/lib/repositories/tags-repository";

export { CLIENT_RECOVERY_DB_PREFIX, getClientRecoveryDatabaseName };

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
