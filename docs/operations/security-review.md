# Security review checklist

Use this checklist before production launch and after material changes to auth, APIs, or dependencies. It reflects the current SKNotes implementation, not a formal penetration test.

## Dependency audit

```bash
npm run audit:ci
```

Runs `npm audit --audit-level=high` (see [`package.json`](../../package.json)).

| Mode                               | Behavior                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current default — non-blocking** | `audit:ci` is **not** part of `npm run ci`. Run it locally or in a scheduled GitHub Action; investigate high/critical findings before release.          |
| **Blocking (optional)**            | Add `npm run audit:ci` to [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) after the `npm ci` step so PRs fail on high-severity advisories. |

Moderate/low findings may require upstream fixes or documented acceptance; record exceptions with CVE ID and mitigation.

## Authentication and session cookies

- **Better Auth** with HTTP-only session cookies via [`nextCookies()`](../../lib/auth/auth.js) plugin.
- **Secret:** `BETTER_AUTH_SECRET` ≥32 characters in production ([`getBetterAuthSecret`](../../lib/db/env.js)).
- **Base URL:** `BETTER_AUTH_URL` must match the deployed origin (cookie scope and email links).
- **Email verification:** required for email/password in production (`requireEmailVerification`); disabled only when `E2E_TEST_MODE=1` (CI/E2E — never in Netlify production).
- **Route protection:** [`proxy.js`](../../proxy.js) redirects unauthenticated users away from `(app)` routes; APIs enforce session via server helpers — UI alone is not sufficient.
- **Google OAuth:** optional; `prompt: "select_account"`; linking trusted to Google provider.

Review cookie flags and CSRF behavior against [Better Auth docs](https://www.better-auth.com/docs) when upgrading the library.

## CSRF and cookie-authenticated mutations

- Better Auth handles CSRF for its own auth endpoints when using cookie sessions.
- Custom JSON APIs (`/api/notes`, `/api/tags`, etc.) rely on **same-site** cookie submission from the SKNotes origin and session validation on each request.
- Do not expose these APIs as cross-origin resources without explicit CORS and token design.
- Re-verify after major Better Auth or Next.js upgrades (see requirements §6 CSRF note).

## Rate limiting

**Better Auth** (production only, Mongo-backed storage) — [`lib/auth/auth.js`](../../lib/auth/auth.js):

| Endpoint area          | Window | Max |
| ---------------------- | ------ | --- |
| Default                | 60s    | 100 |
| Sign-in email          | 60s    | 10  |
| Sign-up email          | 60s    | 5   |
| Password reset request | 300s   | 5   |
| Send verification      | 300s   | 5   |
| Reset password         | 300s   | 10  |
| Delete user            | 3600s  | 3   |

**Application APIs** — [`lib/http/rate-limit.js`](../../lib/http/rate-limit.js) (per user + IP):

| Key prefix       | Window | Max |
| ---------------- | ------ | --- |
| `search`         | 60s    | 120 |
| `notes-write`    | 60s    | 60  |
| `notes-delete`   | 60s    | 30  |
| `tags-write`     | 60s    | 40  |
| `account-delete` | 3600s  | 3   |

429 responses use `ErrorCodes.RATE_LIMITED` with `retryAfter` when applicable.

## Input validation and content safety

- Zod schemas at API boundaries; Lexical JSON validation and size limits on note content.
- Safe link handling in the editor domain layer.
- Generic 500 responses with `requestId` only — details in redacted server logs ([monitoring.md](./monitoring.md)).

## Account deletion cascade

Deleting an account triggers Better Auth `deleteUser` with a **beforeDelete** hook ([`lib/auth/auth.js`](../../lib/auth/auth.js)):

1. [`deleteApplicationDataForUser`](../../lib/application/delete-account.js) removes all **notes** and **tags** for the user ID.
2. Better Auth removes auth user, sessions, and linked accounts.

Client-side IndexedDB recovery data is cleared on logout in the browser (Phase 6); deletion does not wipe other users’ local storage on a shared device — users should sign out on shared browsers.

API path: `DELETE` via [`app/api/account/route.js`](../../app/api/account/route.js) with stricter rate limits.

## Privacy and logging

- Confirm no note content or credentials in logs — [monitoring.md](./monitoring.md).
- Password reset and verification flows avoid email enumeration in user-facing messages (requirements §4.5).

## Operator tasks (human)

- [ ] Resend **domain verification** for production `EMAIL_FROM` — [resend-email.md](../integrations/resend-email.md)
- [ ] Atlas **backup** enabled — [backups.md](./backups.md)
- [ ] Netlify **env vars** set per context — [environment.md](./environment.md)
- [ ] `npm run audit:ci` reviewed for the release commit
- [ ] Google OAuth consent screen and redirect URIs match production domain

## Related

- [Requirements §6](../requirements.md#6-non-functional-requirements)
- [Environment](./environment.md)
