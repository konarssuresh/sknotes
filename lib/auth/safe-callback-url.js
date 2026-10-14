const UNSAFE_PROTOCOL = /^(javascript|data|vbscript):/i;

/**
 * Returns a same-origin relative path safe for redirects, or the fallback.
 * @param {string | null | undefined} candidate
 * @param {string} [fallback="/"]
 */
export function toSafeCallbackPath(candidate, fallback = "/") {
  if (!candidate || typeof candidate !== "string") {
    return fallback;
  }
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (UNSAFE_PROTOCOL.test(trimmed)) {
    return fallback;
  }
  try {
    const parsed = new URL(trimmed, "http://local.invalid");
    if (parsed.origin !== "http://local.invalid") {
      return fallback;
    }
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith("/") ? path : fallback;
  } catch {
    return fallback;
  }
}
