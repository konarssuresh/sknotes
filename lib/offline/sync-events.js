const SYNC_EVENT = "sknotes-offline-sync-change";

/**
 * @param {string} userId
 */
export function emitSyncStateChange(userId) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { userId } }));
}

/**
 * @param {(detail: { userId: string }) => void} listener
 */
export function subscribeSyncStateChange(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = (event) => {
    const detail = event.detail;
    if (detail?.userId) {
      listener(detail);
    }
  };
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
}
