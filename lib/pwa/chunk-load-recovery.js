import { CHUNK_AUTO_RELOAD_KEY } from "@/lib/pwa/sw-session-keys";

/**
 * @param {string | undefined} message
 */
export function isRecoverableLoadError(message) {
  if (!message) {
    return false;
  }
  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Connection closed") ||
    /Minified React error #412/.test(message)
  );
}

export function clearChunkAutoReloadFlag() {
  try {
    sessionStorage.removeItem(CHUNK_AUTO_RELOAD_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {string} message
 * @returns {boolean} whether a reload was scheduled
 */
export function tryRecoverFromLoadError(message) {
  if (!isRecoverableLoadError(message)) {
    return false;
  }
  try {
    if (sessionStorage.getItem(CHUNK_AUTO_RELOAD_KEY) === "1") {
      return false;
    }
    sessionStorage.setItem(CHUNK_AUTO_RELOAD_KEY, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * Registers global listeners for deploy mismatch / partial RSC failures.
 */
export function installChunkLoadRecovery() {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    tryRecoverFromLoadError(event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : String(reason ?? "");
    tryRecoverFromLoadError(message);
  });
}
