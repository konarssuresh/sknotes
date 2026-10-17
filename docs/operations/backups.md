# Database backups and recovery

SKNotes stores user accounts (Better Auth), notes, tags, and rate-limit metadata in **MongoDB Atlas**. Backup policy is chosen by the **operator** when configuring Atlas; this document ties RPO/RTO expectations to that choice and describes how to validate recovery without touching production data.

## Operator choice: Atlas backup tier

Pick one Atlas backup mode and record it in your runbook (team wiki or Netlify site notes):

| Atlas option                                             | Typical RPO                                     | Typical RTO                                              | Notes                                                     |
| -------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| **Continuous cloud backup** (recommended for production) | Minutes (point-in-time within retention window) | Depends on cluster size; plan for restore + app redeploy | Supports PITR within the retention period                 |
| **Daily / weekly snapshot schedule**                     | Up to 24h (or weekly)                           | Longer — full cluster restore                            | Acceptable only if product owners accept data loss window |
| **No managed backup** (dev/free experiments only)        | Undefined                                       | Undefined                                                | **Not acceptable for production SKNotes**                 |

**RPO (recovery point objective):** maximum acceptable data loss measured in time. With continuous backup and a 7-day retention window, RPO is roughly the time since the last successful write before an incident, bounded by retention.

**RTO (recovery time objective):** maximum acceptable downtime. Include Atlas restore time, DNS/URI updates if the cluster changes, running index ensure, and Netlify redeploy or rollback.

Document your chosen tier and numeric RPO/RTO targets here after operator sign-off:

```
Backup tier: _______________________
RPO target:  _______________________
RTO target:  _______________________
Last restore test (non-prod): _______
```

## What to back up

- **MongoDB Atlas:** primary source of truth for notes, tags, auth users/sessions, and application rate-limit counters.
- **Not in Atlas:** client-side IndexedDB drafts and offline queues (per-device). Users may lose unsynced local edits if a device is lost; server backup does not replace Phase 6 offline behavior.
- **Netlify:** application deploy artifacts are reproducible from git; env vars are configured in Netlify — export or document them separately.

## Restore procedure (non-production)

Perform restore drills on a **dedicated non-prod cluster** (or a new Atlas project), never as the first experiment on production.

1. **Create target cluster** — empty M10+ or equivalent with the same major MongoDB version as production.
2. **Restore from backup** — in Atlas, use _Backup_ → choose snapshot or PITR → restore to the non-prod cluster (Atlas documents the exact UI steps for your tier).
3. **Connection string** — note the new `MONGODB_URI` (and `MONGODB_DB_NAME` if used).
4. **Ensure application indexes** — from a machine that can reach the cluster:

   ```bash
   MONGODB_URI="mongodb+srv://..." npm run ensure-indexes
   ```

   This runs [`scripts/ensure-indexes.js`](../../scripts/ensure-indexes.js) for notes/tags query indexes. Better Auth and rate-limit indexes are created at runtime when needed; re-run a smoke test after restore.

5. **Smoke test** — deploy a Netlify preview or run locally against the restored URI:
   - Sign in with a test account present in the backup.
   - Open Home, load a note, run search.
   - Confirm tags and archive/trash lists look consistent.
6. **Record results** — date, operator, backup ID/snapshot time, issues found.

## Production incident restore (outline)

1. Confirm scope (data corruption vs accidental delete vs region outage).
2. Freeze writes if possible (maintenance page or disable deploy) to avoid split-brain.
3. Restore to a **new** cluster or follow Atlas “restore in place” guidance for your tier.
4. Update Netlify production `MONGODB_URI` (and related vars) to the restored cluster; trigger deploy.
5. Run `npm run ensure-indexes` against production **once** after restore if Atlas support recommends it.
6. Verify auth, notes CRUD, and search; monitor error rates.
7. Post-incident: update RPO/RTO actuals and backup retention if needed.

## Before first production launch

- [ ] Enable Atlas backup on the production cluster.
- [ ] Complete at least one **non-prod restore test** and fill in the template above.
- [ ] Confirm [`npm run ensure-indexes`](../../package.json) is in the launch checklist (see release docs in a follow-up PR).

## Related

- [Environment](./environment.md)
- [Deploy](./deploy.md)
- [Monitoring](./monitoring.md)
