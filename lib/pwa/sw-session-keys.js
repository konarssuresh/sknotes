/** sessionStorage: prevent infinite reload loops after SW takeover */
export const SW_CONTROLLER_RELOAD_KEY = "sknotes-sw-reload";

/** sessionStorage: one automatic reload for stale chunks / RSC stream failures */
export const CHUNK_AUTO_RELOAD_KEY = "sknotes-auto-reload";

/** localStorage: last seen SW build version from HTML meta */
export const SW_VERSION_STORAGE_KEY = "sknotes-sw-version";

/** sessionStorage: one reload after inline PWA migration (unregister + cache clear) */
export const SW_MIGRATE_RELOAD_KEY = "sknotes-sw-migrate-reload";

/** localStorage: bump when a one-time client cache migration is required */
export const PWA_MIGRATION_EPOCH_KEY = "sknotes-pwa-migration-epoch";

/** Increment when all clients must run inline cache/SW reset once */
export const PWA_MIGRATION_EPOCH = "2";
