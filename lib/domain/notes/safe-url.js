const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/**
 * @param {string} url
 */
export function isSafeUrl(url) {
  const trimmed = (url ?? "").trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  if (trimmed.startsWith("#")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, "https://example.invalid");
    const scheme = parsed.protocol.toLowerCase();
    if (!ALLOWED_SCHEMES.has(scheme)) {
      return false;
    }
    if (scheme === "mailto:") {
      return true;
    }
    return Boolean(parsed.host);
  } catch {
    return false;
  }
}

/**
 * @param {string} url
 */
export function assertSafeUrl(url) {
  if (!isSafeUrl(url)) {
    throw new Error("Unsafe or invalid URL");
  }
  return url.trim();
}
