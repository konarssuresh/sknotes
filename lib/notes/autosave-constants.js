/** Debounce after last keystroke (product requirement). */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * Max wait while the user keeps typing so saves are not deferred indefinitely.
 * Not fixed in product docs; chosen as a reasonable bound for MVP.
 */
export const AUTOSAVE_MAX_WAIT_MS = 5000;
