import { SKNOTES_SW_VERSION_PLACEHOLDER } from "@/lib/pwa/sw-version";

const VERSION_LINE = `const SKNOTES_SW_VERSION = "${SKNOTES_SW_VERSION_PLACEHOLDER}";`;

/**
 * Validates committed `public/sw.js` before build-time version injection.
 * @param {string} source
 * @returns {string[]} human-readable errors (empty when valid)
 */
export function validateServiceWorkerSource(source) {
  const errors = [];

  if (!source.includes(VERSION_LINE)) {
    errors.push(
      `public/sw.js must declare ${VERSION_LINE} (injected during npm run build)`
    );
  }

  const staticBlockStart = source.indexOf(
    'if (url.pathname.startsWith("/_next/static/"))'
  );
  if (staticBlockStart === -1) {
    errors.push(
      "public/sw.js must handle /_next/static/ with a dedicated if block"
    );
    return errors;
  }

  const staticBlockEnd = source.indexOf(
    'if (url.pathname === "/icon.svg"',
    staticBlockStart
  );
  const staticSection =
    staticBlockEnd === -1
      ? source.slice(staticBlockStart)
      : source.slice(staticBlockStart, staticBlockEnd);

  if (!/network-first/i.test(staticSection)) {
    errors.push("/_next/static/ handler must document network-first caching");
  }

  const cacheFirstStatic =
    /caches\.match\(request\)\.then\(\s*\(cached\)\s*=>\s*cached\s*\|\|\s*fetch/;
  if (cacheFirstStatic.test(staticSection)) {
    errors.push(
      "/_next/static/ must not use cache-first (stale chunk regression)"
    );
  }

  if (
    !/fetch\(request\)/.test(staticSection) ||
    !/cache\.match\(request\)/.test(staticSection)
  ) {
    errors.push(
      "/_next/static/ handler must fetch from network and fall back to cache.match on failure"
    );
  } else {
    const fetchIdx = staticSection.indexOf("fetch(request)");
    const cacheMatchIdx = staticSection.indexOf("cache.match(request)");
    if (fetchIdx === -1 || cacheMatchIdx === -1 || fetchIdx > cacheMatchIdx) {
      errors.push(
        "/_next/static/ must try network fetch before cache.match fallback"
      );
    }
  }

  return errors;
}
