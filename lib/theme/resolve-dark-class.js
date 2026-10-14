import { THEME_STORAGE_KEY } from "./constants.js";

/**
 * Whether the document should use the dark theme class for a stored mode.
 * @param {string | null | undefined} mode
 * @param {boolean} prefersDark
 */
export function shouldUseDarkClass(mode, prefersDark) {
  if (mode === "dark") {
    return true;
  }
  if (mode === "light") {
    return false;
  }
  return prefersDark;
}

/**
 * Read theme mode from localStorage (browser only).
 * @param {Storage | null | undefined} storage
 */
export function readStoredThemeMode(storage) {
  if (!storage) {
    return "system";
  }
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // ignore
  }
  return "system";
}
