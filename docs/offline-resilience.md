# Offline resilience (Phase 6)

## Storage

- Per-user IndexedDB database name: `sknotes-recovery-{userId}` (see `lib/notes/recovery-constants.js`).
- Object stores: `drafts` (editor recovery snapshots) and `mutations` (queued note create/update operations).
- Legacy Phase 4 `localStorage` drafts (`sknotes-recovery-draft-v1:{userId}`) are imported once on first open, then removed.

## Queueable work

- Note **create** and **content update** autosaves while offline or after transient network/gateway failures.
- Tag changes, archive/trash, export, and account APIs require connectivity (not queued in Phase 6).

## Sync semantics

- UI shows **Pending sync** until the server acknowledges the write; **Saved** only after a successful API response.
- Reconnect triggers a serialized queue flush with bounded exponential backoff.
- `409` stale revision pauses the queued item and opens the existing conflict dialog; drafts remain in IndexedDB until resolved.

## Session boundaries

- **Logout:** warns when pending mutations exist; clears TanStack Query caches and **Cache Storage** (PWA service worker caches); retains IndexedDB data for the same user id.
- **Account deletion:** server data is removed via Better Auth `beforeDelete`; client purges the user IndexedDB database and legacy localStorage keys.
