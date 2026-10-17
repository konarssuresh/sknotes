/** sessionStorage: prevent infinite reload loops after SW takeover */
export const SW_CONTROLLER_RELOAD_KEY = "sknotes-sw-reload";

/** sessionStorage: one automatic reload for stale chunks / RSC stream failures */
export const CHUNK_AUTO_RELOAD_KEY = "sknotes-auto-reload";

/** localStorage: last seen SW build version from HTML meta */
export const SW_VERSION_STORAGE_KEY = "sknotes-sw-version";
