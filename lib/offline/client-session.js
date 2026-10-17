import { clearServiceWorkerCaches } from "@/lib/pwa/runtime-caches";

import { clearAllOfflineDrafts } from "./drafts";
import { clearLegacyRecoveryStorage } from "./legacy-local-storage";
import { clearAllPendingMutations } from "./mutations";
import { deleteUserOfflineDatabase } from "./db";
import { getPendingSyncCount } from "./sync-queue";

/**
 * @param {import("@tanstack/react-query").QueryClient} queryClient
 */
export function clearClientSessionState(queryClient) {
  queryClient.clear();
  void clearServiceWorkerCaches();
}

/**
 * @param {string} userId
 */
export async function userHasUnsyncedWork(userId) {
  const count = await getPendingSyncCount(userId);
  return count > 0;
}

/**
 * Removes all offline data for a user (account deletion).
 * @param {string} userId
 */
export async function purgeUserOfflineData(userId) {
  clearLegacyRecoveryStorage(userId);
  if (!userId || typeof window === "undefined") {
    return;
  }
  try {
    await clearAllPendingMutations(userId);
    await clearAllOfflineDrafts(userId);
  } catch {
    // continue to delete database
  }
  await deleteUserOfflineDatabase(userId);
}
