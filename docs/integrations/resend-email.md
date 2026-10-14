# Resend transactional email (Phase 3)

SKNotes sends verification and password-reset email through **Resend**, using a server-only module under `lib/email/`. Better Auth callbacks call that module; client components never touch Resend or API keys.

## Environment variables

| Variable                      | Where                               | Purpose                                                                 |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `RESEND_API_KEY`              | Server only (`.env.local`, Netlify) | Resend API authentication                                               |
| `EMAIL_FROM`                  | Server only                         | Sender on your **verified** domain (e.g. `noreply@mail.yourdomain.com`) |
| `BETTER_AUTH_URL`             | Server                              | Base URL for links Better Auth builds (must match deploy origin)        |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client                              | Better Auth client base URL (same origin as the app)                    |

Placeholders only in [`.env.example`](../../.env.example). Never commit real keys.

## Local development

1. Create a [Resend](https://resend.com) account and API key.
2. For quick tests, use Resend’s test mode / allowed recipients per their docs.
3. Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, `EMAIL_FROM`, and auth/Mongo variables.
4. Run `npm run dev` and complete sign-up / forgot-password flows.

If `RESEND_API_KEY` and `EMAIL_FROM` are unset in non-production Node environments, sends are skipped (no throw) so local work without email is possible. Production builds require configuration.

## Netlify (preview and production)

1. In the Netlify site **Environment variables** UI, set `RESEND_API_KEY`, `EMAIL_FROM`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, MongoDB, and Better Auth secrets for each context (preview vs production).
2. Set `BETTER_AUTH_URL` to the exact site URL (e.g. `https://your-site.netlify.app` or your custom domain).
3. Add the same Google OAuth redirect URIs for each origin if using Google sign-in.

## Domain verification (required for production)

1. In Resend, add and verify your sending domain.
2. Add the DNS records Resend provides:
   - **SPF** (TXT)
   - **DKIM** (CNAME/TXT per Resend)
3. **DMARC** is recommended for deliverability after SPF/DKIM; it is not a substitute for completing Resend domain verification.
4. Set `EMAIL_FROM` to an address on that verified domain.

## Provider limits

Resend plan quotas, rate limits, and pricing are **changeable provider constraints**, not SKNotes product guarantees. Monitor usage in the Resend dashboard and upgrade the plan if needed.

## Security and logging

- Do not log verification/reset tokens, full action URLs, email bodies, or `RESEND_API_KEY`.
- Password-reset **request** responses remain generic (no email enumeration).
- Automated tests mock the email transport; CI does not send to real inboxes.

## Manual verification checklist

- [ ] Email/password sign-up delivers verification email
- [ ] Resend verification from `/verify-email` within rate limits
- [ ] Valid verification link grants app access
- [ ] Expired/invalid/already-used links show clear UI
- [ ] Unverified users cannot use `(app)` routes or private APIs
- [ ] Google sign-in does not send redundant verification when already verified
- [ ] Password reset end-to-end with generic request messaging
- [ ] Resend outage surfaces safe user messaging without secrets in logs
