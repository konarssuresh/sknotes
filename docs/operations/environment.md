# Environment variables

SKNotes reads configuration from process environment variables. Copy [`.env.example`](../../.env.example) to `.env.local` for local development. **Never commit real secrets** to the repository.

Netlify stores the same keys in the site **Environment variables** UI, scoped per deploy context (production, deploy preview, branch deploy). GitHub Actions uses placeholder values for build and E2E only (see [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)).

## Variable matrix

| Variable                      | Required          | Exposed to browser | Local                                                                                  | Netlify preview                                                        | Production                                                          |
| ----------------------------- | ----------------- | ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`                 | Yes               | No                 | Atlas cluster or `mongodb://127.0.0.1:27017/...`                                       | Dedicated preview cluster or shared non-prod URI                       | Production Atlas cluster                                            |
| `MONGODB_DB_NAME`             | No                | No                 | Optional override when the URI does not embed a database name                          | Same                                                                   | Same                                                                |
| `MONGODB_MAX_POOL_SIZE`       | No                | No                 | Rarely needed locally                                                                  | Tune for serverless concurrency                                        | Tune for traffic                                                    |
| `MONGODB_USE_TRANSACTIONS`    | No                | No                 | `false` for standalone/memory Mongo; default follows URI (`true` for `mongodb+srv://`) | Set explicitly if preview uses a non-replica-set URI                   | `true` on Atlas replica sets when using multi-document transactions |
| `BETTER_AUTH_SECRET`          | Yes               | No                 | Long random string (≥32 chars in production)                                           | Unique per environment                                                 | Unique, rotated on compromise                                       |
| `BETTER_AUTH_URL`             | Yes               | No                 | `http://localhost:3000`                                                                | Preview site URL (e.g. `https://deploy-preview-123--site.netlify.app`) | Canonical app URL (custom domain or `*.netlify.app`)                |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes               | Yes                | Same origin as the app                                                                 | Same as preview origin                                                 | Same as production origin                                           |
| `GOOGLE_CLIENT_ID`            | If using Google   | No                 | OAuth client for `http://localhost:3000`                                               | Preview origin in Google console                                       | Production origin                                                   |
| `GOOGLE_CLIENT_SECRET`        | If using Google   | No                 | Server-only                                                                            | Server-only                                                            | Server-only                                                         |
| `RESEND_API_KEY`              | Yes in production | No                 | Optional locally (sends skipped when unset in non-production)                          | Required for email flows on preview                                    | Required                                                            |
| `EMAIL_FROM`                  | Yes in production | No                 | `onboarding@resend.dev` or verified domain address                                     | Verified-domain sender recommended                                     | Address on **verified** Resend domain                               |
| `E2E_TEST_MODE`               | No                | No                 | **Do not set** for normal dev                                                          | **Never** on Netlify                                                   | **Never** — enables test-only auth behavior and `/api/e2e/seed`     |
| `NEXT_PUBLIC_E2E_PWA`         | No                | Yes                | `1` only when testing PWA registration locally                                         | Usually unset                                                          | Unset                                                               |
| `CI`                          | No                | No                 | Set by GitHub Actions in CI                                                            | N/A                                                                    | N/A                                                                 |

Validation helpers live in [`lib/db/env.js`](../../lib/db/env.js). Mongo connection behavior is in [`lib/db/client.js`](../../lib/db/client.js).

## Per-environment notes

### Local

1. Copy `.env.example` → `.env.local`.
2. Point `MONGODB_URI` at MongoDB Atlas (free tier is fine) or a local `mongod`.
3. Keep `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` aligned with the dev server origin.
4. Email is optional for day-to-day UI work; see [Resend integration](../integrations/resend-email.md).

### Netlify deploy preview

- Set variables for the **Deploy Preview** context (or “All” if you use one shared non-prod database).
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` must match the **preview URL** for that deploy, or auth cookies and redirect links will break.
- Add matching Google OAuth authorized redirect URIs for each preview pattern you use, or disable Google on preview.

### Production

- Use a **separate** Atlas cluster (or at minimum a separate database) from personal local dev.
- Rotate `BETTER_AUTH_SECRET` if leaked; all sessions invalidate on change.
- Complete Resend domain verification before launch; see [resend-email.md](../integrations/resend-email.md).

## Secrets hygiene

- No API keys, connection strings, or `BETTER_AUTH_SECRET` in git, client bundles, or public Netlify build logs.
- `NEXT_PUBLIC_*` variables are embedded in the client build — only put non-secret URLs there.
- Review Netlify and Atlas IAM periodically; use least-privilege database users.

## Related

- [Deploy](./deploy.md)
- [Backups](./backups.md)
- [Security review](./security-review.md)
