import { clearServiceWorkerCaches } from "@/lib/pwa/runtime-caches";
import {
  SW_CONTROLLER_RELOAD_KEY,
  SW_VERSION_STORAGE_KEY,
} from "@/lib/pwa/sw-session-keys";

const SKIP_WAITING = { type: "SKIP_WAITING" };

/**
 * @param {ServiceWorker} worker
 */
function promptSkipWaiting(worker) {
  try {
    worker.postMessage(SKIP_WAITING);
  } catch {
    // ignore
  }
}

/**
 * @param {ServiceWorkerRegistration} registration
 */
function watchWaitingWorker(registration) {
  if (registration.waiting) {
    promptSkipWaiting(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) {
      return;
    }
    worker.addEventListener("statechange", () => {
      if (
        worker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        promptSkipWaiting(worker);
      }
    });
  });
}

function readMetaSwVersion() {
  try {
    return (
      document
        .querySelector('meta[name="sknotes-sw-version"]')
        ?.getAttribute("content") ?? null
    );
  } catch {
    return null;
  }
}

/**
 * When deploy changes SW version, drop stale Cache Storage before takeover.
 * @param {string} metaVersion
 */
export async function syncSwVersionWithMeta(metaVersion) {
  if (!metaVersion) {
    return;
  }
  try {
    const stored = localStorage.getItem(SW_VERSION_STORAGE_KEY);
    if (stored === metaVersion) {
      return;
    }
    await clearServiceWorkerCaches();
    localStorage.setItem(SW_VERSION_STORAGE_KEY, metaVersion);
  } catch {
    // ignore quota / private mode
  }
}

let controllerChangeHookInstalled = false;

export function installServiceWorkerControllerReload() {
  if (controllerChangeHookInstalled || typeof window === "undefined") {
    return;
  }
  controllerChangeHookInstalled = true;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    try {
      if (sessionStorage.getItem(SW_CONTROLLER_RELOAD_KEY) === "1") {
        return;
      }
      sessionStorage.setItem(SW_CONTROLLER_RELOAD_KEY, "1");
    } catch {
      // continue to reload
    }
    window.location.reload();
  });
}

export function clearServiceWorkerReloadFlag() {
  try {
    sessionStorage.removeItem(SW_CONTROLLER_RELOAD_KEY);
  } catch {
    // ignore
  }
}

/**
 * @returns {Promise<ServiceWorkerRegistration | null>}
 */
export async function registerProductionServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  installServiceWorkerControllerReload();

  const metaVersion = readMetaSwVersion();
  if (metaVersion) {
    await syncSwVersionWithMeta(metaVersion);
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  watchWaitingWorker(registration);
  await registration.update().catch(() => {
    // offline or throttled update checks
  });

  return registration;
}
