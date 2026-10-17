/**
 * Clears Cache Storage entries on logout so no stale shell is reused across accounts.
 */
export async function clearServiceWorkerCaches() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}
