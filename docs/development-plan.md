# SKNotes — Phased Development Plan

**Approach:** Cursor-led implementation in small, reviewable phases. Do not ask Cursor to build the full app in one prompt. Each phase has a deliverable, checks, and an exit gate.

## Current project status

- Next.js App Router scaffold exists in JavaScript with Tailwind CSS, ESLint, Prettier, and shadcn/ui `base-nova` configured.
- Design brief, tokens, screen specifications, and interaction specifications exist.
- A standalone HTML/CSS/vanilla JS prototype exists and has passed basic syntax checks. Browser-level review is still needed for visual/interaction confidence.
- The prototype has follow-up scope for SKNotes branding/logo and mock Login/Sign up screens, requested after the initial review.
- Production app features and backend integrations have not been implemented yet.

## Delivery principles

- Keep JavaScript/JSX; follow the current stable Next.js App Router conventions supported by the selected Netlify setup.
- Add dependencies only in the phase that needs them. Verify current compatibility before installing Better Auth, MongoDB integration, Lexical, TanStack Query, Zustand, Zod, or offline libraries.
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
- Add Better Auth email/password, Google sign-in, verification/resend, password reset, session, logout, and protected route behavior.
- Build login, signup, verification, and password-reset forms using the shared React Hook Form field adapter; verify accessible labels, validation messages, pending/error/success states, and server-side Zod revalidation.
- Build shared request validation, session/ownership helpers, structured API errors/request IDs, request-size limits, and rate-limit hooks.
- Add auth and repository integration tests, including isolation between two users.
- Implement account deletion only with a safe cascade/cleanup plan and confirmation flow.

### Exit gate

Authentication flows work in local and preview environments; private APIs enforce user ownership; invalid/unauthenticated/foreign-resource cases behave safely; no credentials or sensitive content appear in client bundles/logs; auth integration tests pass.

## Phase 3 — Notes core and rich-text editor

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

## Phase 4 — Organization, search, and retrieval

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

## Phase 5 — Limited offline resilience

### Work

- Add IndexedDB storage for user-scoped local drafts/snapshots and queued mutations.
- Add online/offline and pending-sync indicators with clear server-confirmed semantics.
- Queue eligible edits offline, retry on reconnect with bounded backoff, and keep data until server acknowledgement.
- Reconcile by expected revision; expose explicit server-vs-local resolution and preserve recovery copies until resolution completes.
- On logout, warn about unsynced edits, clear active in-memory/query state, retain only user-scoped recovery data, and restore only for that same user.
- Test offline edit/reconnect, failed sync, logout/relogin isolation, stale revision, and cleanup after restore/delete/account deletion.

### Exit gate

Network loss does not silently discard typed content; reconnect behavior is understandable; save indicators distinguish local queued state from server persistence; another account cannot see these recovery records.

## Phase 6 — Production readiness, PWA, and release

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

- **Unit:** domain lifecycle and validation rules, autosave/max-wait behavior, revisions, tag normalization, search adapters, export conversion, offline queue state.
- **Integration:** Route Handlers, Better Auth session boundaries, Mongo repositories, ownership isolation, conditional updates, search, cursor pagination, migrations/indexes.
- **End-to-end:** sign-up/sign-in, create/edit/save, search/filter, pin/archive/trash/restore, delete confirmation, export, conflict resolution, offline recovery, logout/relogin scoping.
- **CI:** lint, formatting check, tests, production build, critical end-to-end suite; Netlify PR previews; protected-main production deployment.
- Prefer behavior coverage that protects user data and key workflows over arbitrary coverage percentages.

## Risks and decision checkpoints

| Risk                                        | Handling                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth or Netlify runtime mismatch     | Phase 2 compatibility spike before building auth-dependent application behavior                                                  |
| MongoDB substring-search cost               | Define matching semantics, validate against realistic data, keep search interface replaceable; adopt Atlas Search only if needed |
| Cursor pagination with changing `updatedAt` | Compound cursor, reconcile after edits, integration tests across page boundaries                                                 |
| Offline conflict and account leakage        | Revision checks, IndexedDB user scoping, logout cleanup, multi-account tests                                                     |
| PWA cache leakage                           | Add late, test authenticated cache boundaries, avoid caching private API responses indiscriminately                              |
| Backup promises exceed Atlas plan           | Choose RPO/RTO only after plan selection; restore-test the actual configuration                                                  |
| Design specs diverge                        | Treat this requirements file as product behavior source; update linked design specs as issues are resolved                       |
