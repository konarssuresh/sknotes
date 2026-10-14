# Phase 2 compatibility check

**Date:** Phase 2 implementation  
**Stack:** Next.js 16.4, Better Auth 1.7.7, `@better-auth/mongo-adapter`, MongoDB Node driver, Netlify `@netlify/plugin-nextjs`

## Results

| Integration           | Status                                            | Evidence                                                                                                                                                                      |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth + MongoDB | **Compatible**                                    | `mongodbAdapter` from `@better-auth/mongo-adapter`; integration test `tests/integration/auth-mongo-spike.test.js` connects via `mongodb-memory-server` and loads `getAuth()`. |
| Next.js App Router    | **Compatible**                                    | `app/api/auth/[...all]/route.js` uses `toNextJsHandler`; `nextCookies()` plugin configured; `(app)` layout uses server `requireSession()`.                                    |
| Netlify Node runtime  | **Compatible (by design)**                        | DB/auth in Route Handlers and server modules only; global Mongo client reuse in `lib/db/client.js`; no Edge runtime for persistence.                                          |
| Email verify / reset  | **Code complete; delivery needs SMTP**            | `lib/email/send-auth-email.js` sends when `SMTP_*` and `EMAIL_FROM` are set; dev/test no-op without SMTP.                                                                     |
| Google OAuth          | **Code complete; needs Google Cloud credentials** | Enabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set; callback `…/api/auth/callback/google`.                                                                    |

## Atlas vs local Mongo

- **Atlas (M0+):** Use `mongodb+srv://` URI; pass `MongoClient` to the adapter (transactions supported).
- **Standalone / memory server (CI):** Set `MONGODB_USE_TRANSACTIONS=false` (default for non-SRV URIs).

## Manual verification still required

1. Configure real `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` on Netlify preview.
2. Configure SMTP for verification and password-reset emails.
3. Register Google OAuth redirect URIs for each deployment origin.
