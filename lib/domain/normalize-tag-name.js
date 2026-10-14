/**
 * Canonical per-user tag name for uniqueness (case-insensitive).
 * @param {string} name
 * @returns {string}
 */
export function normalizeTagName(name) {
  return name.trim().toLocaleLowerCase();
}
