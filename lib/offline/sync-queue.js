import {
  createNoteRequest,
  updateNoteRequest,
} from "@/features/notes/note-api";

import {
  MAX_SYNC_ATTEMPTS,
  SYNC_BASE_DELAY_MS,
  SYNC_MAX_DELAY_MS,
} from "./constants";
import {
  deletePendingMutation,
  listPendingMutations,
  updatePendingMutation,
  upsertPendingMutation,
} from "./mutations";
import { isQueueableNetworkError } from "./network";
import { emitSyncStateChange } from "./sync-events";

let flushInFlight = null;

/**
 * @param {number} attempts
 */
export function computeSyncBackoffMs(attempts) {
  return Math.min(SYNC_BASE_DELAY_MS * 2 ** attempts, SYNC_MAX_DELAY_MS);
}

/**
 * @param {string} userId
 * @param {import("./constants").OfflineMutationRecord} record
 */
export async function enqueueNoteMutation(userId, record) {
  await upsertPendingMutation(userId, {
    ...record,
    attempts: 0,
    lastError: null,
    blockedConflict: false,
    createdAt: new Date().toISOString(),
  });
  emitSyncStateChange(userId);
}

/**
 * @param {string} userId
 * @param {{
 *   onNoteCreated?: (note: Record<string, unknown>, mutation: import("./constants").OfflineMutationRecord) => void;
 *   onNoteUpdated?: (note: Record<string, unknown>, mutation: import("./constants").OfflineMutationRecord) => void;
 *   onConflict?: (error: Error & { conflictDetails?: unknown }, mutation: import("./constants").OfflineMutationRecord) => void;
 * }} [handlers]
 */
export async function flushMutationQueue(userId, handlers = {}) {
  if (!userId) {
    return { applied: 0, conflicts: 0, stopped: false };
  }

  if (flushInFlight) {
    return flushInFlight;
  }

  const run = async () => {
    const pending = await listPendingMutations(userId);
    let applied = 0;
    let conflicts = 0;
    let stopped = false;

    for (const mutation of pending) {
      if (mutation.blockedConflict) {
        conflicts += 1;
        continue;
      }

      if (mutation.attempts > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, computeSyncBackoffMs(mutation.attempts - 1));
        });
      }

      try {
        if (mutation.op === "create") {
          const created = await createNoteRequest({
            title: mutation.title,
            content: mutation.content,
          });
          await deletePendingMutation(userId, mutation.id);
          handlers.onNoteCreated?.(created, mutation);
          applied += 1;
        } else {
          const updated = await updateNoteRequest(mutation.noteId, {
            expectedRevision: mutation.expectedRevision,
            title: mutation.title,
            content: mutation.content,
          });
          await deletePendingMutation(userId, mutation.id);
          handlers.onNoteUpdated?.(updated, mutation);
          applied += 1;
        }
      } catch (error) {
        if (error?.isConflict) {
          await updatePendingMutation(userId, mutation.id, {
            blockedConflict: true,
            lastError: "conflict",
          });
          handlers.onConflict?.(error, mutation);
          conflicts += 1;
          continue;
        }

        const nextAttempts = mutation.attempts + 1;
        await updatePendingMutation(userId, mutation.id, {
          attempts: nextAttempts,
          lastError: error instanceof Error ? error.message : "sync failed",
        });

        if (
          isQueueableNetworkError(error) ||
          nextAttempts >= MAX_SYNC_ATTEMPTS
        ) {
          stopped = true;
          break;
        }
      }
    }

    emitSyncStateChange(userId);
    return { applied, conflicts, stopped };
  };

  flushInFlight = run();
  try {
    return await flushInFlight;
  } finally {
    flushInFlight = null;
  }
}

/**
 * @param {string} userId
 */
export async function hasPendingSyncWork(userId) {
  const pending = await listPendingMutations(userId);
  return pending.some((m) => !m.blockedConflict || m.blockedConflict);
}

/**
 * @param {string} userId
 */
export async function getPendingSyncCount(userId) {
  const pending = await listPendingMutations(userId);
  return pending.length;
}
