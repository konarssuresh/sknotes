/**
 * URL path rules for the production service worker.
 * Kept in lib/ so Vitest can lock the policy without loading `public/sw.js`.
 */

const NETWORK_ONLY_PREFIXES = [
  "/api/",
  "/login",
  "/signup",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

const NETWORK_ONLY_EXACT = new Set([
  "/",
  "/settings",
  "/archive",
  "/trash",
  "/tags",
]);

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isNetworkOnlyPath(pathname) {
  if (!pathname || pathname[0] !== "/") {
    return true;
  }
  for (const prefix of NETWORK_ONLY_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix)) {
      return true;
    }
  }
  if (NETWORK_ONLY_EXACT.has(pathname)) {
    return true;
  }
  if (
    pathname.startsWith("/notes") ||
    pathname.startsWith("/tags/") ||
    pathname.startsWith("/settings/")
  ) {
    return true;
  }
  return false;
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isStaticPrecacheCandidate(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname === "/icon.svg" ||
    pathname.startsWith("/icons/")
  );
}
