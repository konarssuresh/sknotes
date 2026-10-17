export function isBrowserOnline() {
  if (typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine !== false;
}

/**
 * @param {unknown} error
 */
export function isQueueableNetworkError(error) {
  if (!isBrowserOnline()) {
    return true;
  }
  if (error instanceof TypeError) {
    return true;
  }
  const status = error?.status;
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }
  return false;
}

export class OfflineQueuedError extends Error {
  constructor(message = "Changes queued for sync") {
    super(message);
    this.name = "OfflineQueuedError";
    this.isOfflineQueued = true;
  }
}
