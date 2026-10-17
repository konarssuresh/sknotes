/**
 * SKNotes production service worker — static precache only; sensitive routes are network-only.
 * SKNOTES_SW_VERSION is injected at build time (scripts/inject-sw-version.mjs).
 */
const SKNOTES_SW_VERSION = "__SKNOTES_SW_VERSION__";
const PRECACHE = `sknotes-static-${SKNOTES_SW_VERSION}`;

const PRECACHE_URLS = ["/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

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

function isNetworkOnlyPath(pathname) {
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

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("sknotes-") && key !== PRECACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (isNetworkOnlyPath(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    // Network-first: cache-first served stale chunks after deploy and crashed the app.
    event.respondWith(
      caches.open(PRECACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          return fetch(request);
        }
      })
    );
    return;
  }

  if (url.pathname === "/icon.svg" || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  event.respondWith(fetch(request));
});
