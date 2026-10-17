import {
  clearOfflineDraft,
  readOfflineDraft,
  writeOfflineDraft,
} from "@/lib/offline/drafts";

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export async function readRecoveryDraft(userId, draftKey) {
  return readOfflineDraft(userId, draftKey);
}

/**
 * @param {string} userId
 * @param {string} draftKey
 * @param {{ title: string; content: unknown; savedAt: string }} draft
 */
export async function writeRecoveryDraft(userId, draftKey, draft) {
  await writeOfflineDraft(userId, draftKey, draft);
}

/**
 * @param {string} userId
 * @param {string} draftKey
 */
export async function clearRecoveryDraft(userId, draftKey) {
  await clearOfflineDraft(userId, draftKey);
}
