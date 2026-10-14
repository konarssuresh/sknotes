# Database migrations and indexes

SKNotes uses backward-compatible, idempotent index creation. Document shape changes should remain compatible with existing documents (additive fields, defaults in application code).

## Application collections

- `notes` — user-owned note documents (see `docs/architecture.md`).
- `tags` — user-owned tags with `normalizedName` for per-user uniqueness.

Better Auth manages its own collections (`user`, `session`, `account`, `verification`, `rateLimit`, etc.) automatically.

## Indexes (Phase 2)

| Collection | Index                                              | Purpose                                        |
| ---------- | -------------------------------------------------- | ---------------------------------------------- |
| `tags`     | `{ userId: 1, normalizedName: 1 }` unique          | Prevent case-only duplicate tag names per user |
| `notes`    | `{ userId: 1, status: 1, updatedAt: -1, _id: -1 }` | Active/archive/trash list pagination (Phase 4) |
| `notes`    | `{ userId: 1, _id: 1 }`                            | Ownership lookups                              |

## Apply indexes

With `MONGODB_URI` (and optional `MONGODB_DB_NAME`) set:

```bash
npm run ensure-indexes
```

Safe to re-run; uses `createIndex` with stable names.

## Account deletion and client recovery (Phase 5)

On account deletion, server data in `notes` and `tags` is removed in Better Auth `beforeDelete`. Client-side IndexedDB recovery databases must use the stable user id namespace documented in `lib/application/delete-account.js` (`sknotes-recovery-{userId}`) and be cleared after successful deletion in Phase 5.
