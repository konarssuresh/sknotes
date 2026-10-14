# SKNotes — Phased Development Plan

**Approach:** Cursor-led implementation in small, reviewable phases. Do not ask Cursor to build the full app in one prompt. Each phase has a deliverable, checks, and an exit gate.

## Current project status

- Next.js App Router scaffold exists in JavaScript with Tailwind CSS, ESLint, Prettier, and shadcn/ui `base-nova` configured.
- Design brief, tokens, screen specifications, and interaction specifications exist.
- A standalone HTML/CSS/vanilla JS prototype exists and has passed basic syntax checks. Browser-level review is still needed for visual/interaction confidence.
- The prototype has follow-up scope for SKNotes branding/logo and mock Login/Sign up screens, requested after the initial review.
- Phase 1 application foundation and Phase 2 backend, database, and authentication are implemented (Better Auth, MongoDB, auth UI, route protection, and email callback hooks).
- Phase 3 transactional email and account verification are implemented (Resend, branded templates, verified-email gates, tests). Production delivery still requires operator Resend domain verification and Netlify env configuration.

## Delivery principles

- Keep JavaScript/JSX; follow the current stable Next.js App Router conventions supported by the selected Netlify setup.
- Add dependencies only in the phase that needs them. Verify current compatibility before installing Better Auth, MongoDB integration, Resend, Lexical, TanStack Query, Zustand, Zod, or offline libraries.
- Verify Resend integration and Better Auth email callbacks in Phase 3 before treating auth email as production-ready.
- Preserve the design/production boundary: prototype code is a visual reference, not production code to copy wholesale.
- Complete the phase exit checks before starting dependent work. If a dependency/integration is uncertain, build a minimal compatibility spike first.
- Tests are explicitly part of this agreed plan; write them alongside the relevant features.

## Phase 0 — Requirements, design, and prototype

**State:** Design specifications and a working baseline prototype exist. Requirements and architecture are now being consolidated. Prototype branding/auth additions and browser visual QA remain.

### Work

- Maintain the four design documents under `docs/design/`.
- Add **SKNotes** wordmark and original logo to the prototype.
- Add mock Login and Sign up screens (no backend, no real credential transmission), with mocked success and navigation.
- Ensure Home, Notes, Editor, Tags, Archive, Trash, and Settings flows match the requirements.
- Resolve document inconsistencies, including `_id` tie-break direction (`DESC` is frozen).
- Test mobile/desktop widths, light/dark/system themes, keyboard/focus, reduced motion, empty/loading/error states, and key note flows in an actual browser.
- Freeze approved component and behavior decisions; keep open items explicit.

### Exit gate

Prototype is reviewed at mobile and desktop sizes; primary journeys work; brand/auth pages are represented; accessibility basics and both themes are reviewed; product rules are consistent across requirements and design docs. This gate approves design intent, not production auth/security.

## Phase 1 — Application foundation

### Work

- Review the existing scaffold, package scripts, environment handling, and generated Next.js agent guidance.
- Establish the production app shell, route groups, JavaScript module conventions, import aliases, error/not-found/loading UI, and token-to-Tailwind/shadcn theme mapping.
- Add only the dependencies and test tools needed for this project; keep lockfile and package scripts coherent.
- Add `.env.example` with names/placeholders only; never commit secrets.
- Build shared accessible form controls and a React Hook Form field adapter that encapsulates common `Controller`/`useController` wiring; add examples and focused tests.
- Configure test pyramid structure and CI checks: lint, formatting, unit/integration test commands, production build.
- Verify Netlify support for the selected Next.js runtime features with an empty deploy preview or minimal compatibility spike.

### Exit gate

The unchanged app scaffold builds and runs; routes/layout conventions are documented; theme works in light/dark/system; test and CI commands are reproducible; preview deploy proves the intended runtime path.

## Phase 2 — Backend, database, and authentication

### Work

- Prove Better Auth + MongoDB Atlas + Netlify Node runtime compatibility before implementing user-facing flows.
- Configure Atlas connection reuse for serverless invocations; validate environment variables at startup/runtime without leaking secret values.
- Define user identity integration and normalized Note/Tag document validators; add essential indexes and migration/index setup documentation.
- Add Better Auth email/password, Google sign-in, session, logout, and protected route behavior, with **email verification/resend and password-reset callbacks** wired to a server email module (delivery completed in Phase 3).
- Build login, signup, verification, and password-reset forms using the shared React Hook Form field adapter; verify accessible labels, validation messages, pending/error/success states, and server-side Zod revalidation.
- Build shared request validation, session/ownership helpers, structured API errors/request IDs, request-size limits, and rate-limit hooks.
- Add auth and repository integration tests, including isolation between two users.
- Implement account deletion only with a safe cascade/cleanup plan and confirmation flow.

### Exit gate

Authentication flows work in local and preview environments without requiring live email delivery in CI; private APIs enforce user ownership; invalid/unauthenticated/foreign-resource cases behave safely; no credentials or sensitive content appear in client bundles/logs; auth integration tests pass. Verification and reset **sending** through a production provider is completed in Phase 3.

## Phase 3 — Transactional email and email verification

**Goal:** Complete end-to-end email for SKNotes using **Resend** with Better Auth for verification and password reset.

### Work

#### Resend setup

- Create and configure a Resend account; generate an API key stored only in environment variables (`RESEND_API_KEY`).
- Verify a sending domain in Resend; document operator steps and required DNS records (**SPF**, **DKIM**). Note **DMARC** as recommended deliverability follow-up, not a substitute for Resend domain verification.
- Send only from a verified domain using `EMAIL_FROM` (for example `noreply@your-verified-domain`).
- Keep the provider behind a small server-only email module under `lib/email/` (for example `sendTransactionalEmail({ to, subject, html, text })` with a Resend adapter) so Better Auth and the rest of the app are not coupled to Resend types.
- Document **local development** vs **Netlify production/preview** configuration separately (placeholders only in `.env.example`; never commit real secrets).
- Local dev: Resend test API key and safe recipient addresses; CI: mock the email transport or use Resend test mode—automated tests must not send to real user inboxes.

#### Better Auth email integration

- Connect Better Auth `sendVerificationEmail`, `sendResetPassword`, and related resend paths to the shared email service.
- Add branded SKNotes templates (Quiet Paper tone): clear subject lines, accessible HTML, and plain-text fallback.
- Build links from `BETTER_AUTH_URL` and Better Auth–issued token URLs; document safe `callbackURL` / `redirectTo` destinations.
- Do not log API keys, tokens, or full verification/reset URLs.

#### Complete email verification flow

- On email/password sign-up: create the account and send a verification email; show a clear **check your email** state.
- Support resend verification with rate limits; handle valid, expired, already-used, and invalid links with clear outcomes.
- Mark the account verified only after successful server-side token validation (Better Auth).
- **Verified-email gate:** email/password users who are not verified cannot access `(app)` routes—redirect to `/verify-email`; private APIs reject unverified users with stable errors.
- Google sign-in: honor provider verified-email semantics; do not send a redundant verification email when Better Auth already treats the account as verified.

#### Password reset flow

- Send password-reset email through the same email service.
- Cover request, delivery, valid/expired/used link handling, successful reset, and sign-in afterward.
- Use generic responses on reset requests so the UI does not reveal whether an email address has an account.

#### Delivery reliability and abuse protection

- Map Resend/provider errors to safe user feedback and structured server logs (request ID, error category; no secrets).
- Apply reasonable rate limits on verification resend and password-reset requests (align with Better Auth and existing app rate-limit hooks).
- Document Resend plan limits (for example free-tier quotas) as **changeable provider constraints**, not SKNotes product guarantees.

#### Validation

- Add unit/integration tests with a mocked Resend client or test API; never send real email in CI.
- Verification checklist for local and deployed environments: sign-up delivery, resend verification, successful verification, expired/invalid links, password reset end-to-end, Google sign-in without redundant verify email, provider failure handling, unverified users blocked from the app.

### Exit gate

Verification and password-reset emails deliver reliably from a verified domain in configured local and Netlify preview environments; branded templates render accessibly; unverified email/password users cannot use signed-in app routes; enumeration-safe reset messaging works; tests pass without contacting real inboxes; logs exclude tokens and credentials.

## Phase 4 — Notes core and rich-text editor

### Work

- Implement Note repository and use cases for create, read, update, archive/trash state guards, revision checks, and export serialization primitives.
- Add Notes API with server validation and atomic `_id + userId + expectedRevision` update semantics.
- Integrate Lexical with a separate plain-text title and body-first focus.
- Implement debounced autosave: 800 ms after typing stops plus max wait; serialize updates, preserve local recovery draft, handle bounded retries, and show server-confirmed Saving/Saved/Error states.
- Implement navigation protection for dirty/in-flight/failed edits and safe new-draft behavior.
- Add basic conflict screen retaining server and local versions; never silently overwrite.
- Add unit tests for domain rules/autosave ordering and integration tests for revision conflicts and ownership.

### Exit gate

A signed-in user can create/edit a note, reload and retrieve it, see accurate save status, retry failed saves, and resolve a forced stale-revision conflict without losing either version. Rich-text JSON and derived plain text stay consistent.

## Phase 5 — Organization, search, and retrieval

### Work

- Implement Tag CRUD, stable tag IDs, per-user normalized uniqueness, counts, unused tags, and tag filters.
- Use the shared field adapter for tag create/rename and settings forms; avoid per-screen repeated `Controller` boilerplate.
- Implement pins, Home grouping, active/archived/trash lifecycle, restore, and permanent delete confirmations.
- Implement server search over title, derived plain text, and tag references/names behind a replaceable interface.
- Implement cursor pagination: 30-item page, server max, `updatedAt DESC, _id DESC`, opaque compound cursor, indexes, and `useInfiniteQuery` + IntersectionObserver.
- Add TanStack cache invalidation/optimistic reconciliation for edited notes, tags, status changes, and active searches.
- Implement individual Markdown and plain-text exports without modifying source notes.
- Add unit and integration coverage for tag normalization, lifecycle invariants, search scoping, cursor boundaries, duplicate/gap behavior, and export format.

### Exit gate

A user can retrieve notes by search/tag/recency; page through large lists without duplicates under expected conditions; rename tags without changing references; archive/edit/unarchive, trash/restore, and permanently delete safely; and export an individual note.

## Phase 6 — Limited offline resilience

### Work

- Add IndexedDB storage for user-scoped local drafts/snapshots and queued mutations.
- Add online/offline and pending-sync indicators with clear server-confirmed semantics.
- Queue eligible edits offline, retry on reconnect with bounded backoff, and keep data until server acknowledgement.
- Reconcile by expected revision; expose explicit server-vs-local resolution and preserve recovery copies until resolution completes.
- On logout, warn about unsynced edits, clear active in-memory/query state, retain only user-scoped recovery data, and restore only for that same user.
- Test offline edit/reconnect, failed sync, logout/relogin isolation, stale revision, and cleanup after restore/delete/account deletion.

### Exit gate

Network loss does not silently discard typed content; reconnect behavior is understandable; save indicators distinguish local queued state from server persistence; another account cannot see these recovery records.

## Phase 7 — Production readiness, PWA, and release

### Work

- Complete account/settings UI, including theme preference, profile/account controls, logout warning, account deletion, and authentication screens.
- Add installable PWA/service-worker support only after verifying caching cannot expose private content across accounts or serve stale auth-sensitive responses.
- Complete WCAG 2.2 AA review where applicable: keyboard, screen reader, contrast, focus, dialog/sheet behavior, reduced motion, target sizes.
- Complete unit, integration, and critical end-to-end tests for sign-in, note create/edit/autosave, search, tags, archive, trash/restore, export, conflict, offline recovery, and deletion.
- Run dependency/security review, production build, Netlify preview checks, environment/secrets review, privacy-safe logging/error monitoring, and performance checks on representative mobile devices/data.
- Configure Atlas managed backups appropriate to the selected plan; document RPO/RTO and test restore in a separate environment.
- Protect `main`; require CI checks and review; deploy production only from approved `main`.

### Exit gate

Critical checks pass in CI and preview; backup restore is demonstrated; security, privacy, accessibility, operational and rollback procedures are documented; production deploy is ready.

## Cross-phase verification strategy

- **Unit:** domain lifecycle and validation rules, autosave/max-wait behavior, revisions, tag normalization, search adapters, export conversion, offline queue state, email template rendering helpers.
- **Integration:** Route Handlers, Better Auth session boundaries, Mongo repositories, ownership isolation, conditional updates, email service mocks, verification/reset callbacks, unverified-route blocking, search, cursor pagination, migrations/indexes.
- **End-to-end:** sign-up/sign-in, email verification and resend, password reset, create/edit/save, search/filter, pin/archive/trash/restore, delete confirmation, export, conflict resolution, offline recovery, logout/relogin scoping.
- **CI:** lint, formatting check, tests, production build, critical end-to-end suite; Netlify PR previews; protected-main production deployment.
- Prefer behavior coverage that protects user data and key workflows over arbitrary coverage percentages.

## Risks and decision checkpoints

| Risk                                         | Handling                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth or Netlify runtime mismatch      | Phase 2 compatibility spike before building auth-dependent application behavior                                                  |
| MongoDB substring-search cost                | Define matching semantics, validate against realistic data, keep search interface replaceable; adopt Atlas Search only if needed |
| Cursor pagination with changing `updatedAt`  | Compound cursor, reconcile after edits, integration tests across page boundaries                                                 |
| Offline conflict and account leakage         | Revision checks, IndexedDB user scoping, logout cleanup, multi-account tests                                                     |
| PWA cache leakage                            | Add late, test authenticated cache boundaries, avoid caching private API responses indiscriminately                              |
| Backup promises exceed Atlas plan            | Choose RPO/RTO only after plan selection; restore-test the actual configuration                                                  |
| Design specs diverge                         | Treat this requirements file as product behavior source; update linked design specs as issues are resolved                       |
| Resend domain verification or deliverability | Complete Phase 3 with verified domain, SPF/DKIM, and preview smoke tests before relying on email auth in production              |
| Resend rate or plan limits                   | Treat provider quotas as operational constraints; surface safe errors; do not promise delivery SLAs beyond configured provider   |
