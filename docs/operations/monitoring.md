# Monitoring and observability

SKNotes does not ship a vendor-specific APM agent in the MVP. Operators can still trace failures, respect privacy requirements, and plug in optional tools at clear integration points.

## Request IDs

Every custom API Route Handler under `app/api/` (notes, tags, search, account, export) assigns a **request ID**:

- Incoming `x-request-id` is honored when present and ≤128 characters.
- Otherwise a new UUID is generated — see [`lib/logging/request-context.js`](../../lib/logging/request-context.js).

Responses include `x-request-id` on success and error JSON bodies include `requestId` for unexpected failures ([`lib/errors/handle-route-error.js`](../../lib/errors/handle-route-error.js)).

**How to use:**

1. When a user reports “Something went wrong,” ask for the time and action; check server logs for the matching `requestId` if you export Netlify function logs.
2. Propagate `x-request-id` from your browser devtools Network tab when opening support tickets internally.
3. Do not treat request IDs as secrets; they are correlation handles only.

## What never to log

Per [requirements §6](../requirements.md#6-non-functional-requirements) and `redactForLog` in request context:

- Note **title** or **body** / plain text / Lexical content
- **Passwords**, session tokens, OAuth secrets, verification or reset tokens
- Full **action URLs** from email (they contain tokens)
- Transactional **email bodies**, Resend API keys
- **Authorization** headers, **cookies**, local recovery draft content

Server logs for unexpected API errors log only `requestId`, error message, and redacted metadata — not raw request bodies.

Extend `SENSITIVE_KEYS` in [`lib/logging/request-context.js`](../../lib/logging/request-context.js) if new fields risk leaking user content.

## Structured logging today

- **API errors:** `console.error` with `{ requestId, error, meta }` on unhandled exceptions.
- **Netlify:** function and edge logs in the Netlify dashboard; no centralized log store in-repo.
- **MongoDB Atlas:** metrics and alerts for connections, opcounters, disk — configure in Atlas UI.

## Client error reports (Phase 8)

When `CLIENT_ERROR_REPORTING_ENABLED=1`, the app accepts `POST /api/client-error` with a small JSON payload (route, error message, optional digest, last API `requestId`, SW/build hints). The route is rate-limited per IP and **never** accepts note title/body, cookies, or tokens. Reports are logged server-side with `[client-error]` and the handler `requestId` for correlation.

Enable in Netlify production or preview when debugging user-reported “Something went wrong” screens. Leave unset to no-op (HTTP 204).

## Optional integrations (not bundled)

Choose zero or one error tracking stack; wire at these boundaries:

| Integration             | Suggested hook                                                                    | Notes                                                           |
| ----------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Sentry** (or similar) | `handleRouteError` for non-`ApiError` paths; Netlify build plugin for source maps | Scrub PII; use `beforeSend` to drop note fields                 |
| **OpenTelemetry**       | Next.js instrumentation / Netlify observability                                   | Export traces for `/api/*` latency                              |
| **Uptime**              | Synthetic GET to `/login` or health route                                         | No dedicated health route in MVP — external ping of public page |

Better Auth and Resend failures should log provider-safe messages only (see email module under `lib/email/`).

## Alerts (recommended minimum)

- Netlify deploy **failed** notification
- Atlas **disk / connection** threshold alerts
- Spike in HTTP **5xx** on Netlify (if available on your plan)
- Resend **bounce/complaint** rates via Resend dashboard

## Related

- [Security review](./security-review.md)
- [Deploy](./deploy.md)
