# SKNotes — Product Requirements Specification

**Status:** Frozen MVP scope, consolidated from the product decisions and current design documents  
**Product name:** SKNotes  
**Audience:** Cursor implementation and project review

## 1. Product summary

SKNotes is a personal, mobile-first notes app for quickly capturing and reliably finding a user's own notes. Its visual direction is **Quiet Paper**: calm, minimal, readable, and distinct from Apple Notes. The MVP is a focused notes product, not a general-purpose workspace.

The two primary jobs are:

1. Capture notes quickly, with the editor ready for writing and unobtrusive autosave.
2. Retrieve notes through recency, search, tags, pins, and clear archive/trash lifecycle views.

The design reference is in [`design/`](design/): brief, tokens, screen specifications, and interaction specifications. This file freezes product behavior; those design documents define the UI presentation and should be kept aligned with this specification.

## 2. Frozen product and technology decisions

- Product name: **SKNotes**.
- Production app: Next.js App Router, JavaScript/JSX (not TypeScript), using current stable Next.js conventions compatible with the deployment target.
- Hosting: Netlify.
- Database: MongoDB Atlas.
- Authentication: Better Auth, including Google sign-in and email/password registration, verification, password reset, and session management; validate integrations before building dependent flows.
- Rich text: Lexical.
- UI: Tailwind CSS and shadcn/ui, retaining the configured `base-nova` foundation.
- Forms: React Hook Form with reusable application field adapters around accessible building-block controls.
- Server state: TanStack Query; client-only UI/editor state: Zustand where state is shared across client components.
- API input validation: Zod at server boundaries.
- Architecture: one Next.js application with Route Handlers and distinct domain/use-case and repository layers; no separate Express service for the MVP.
- Prototype: independent standalone HTML/CSS/vanilla JS with mock data. It does not authenticate users or connect to production services.

**Language precedence:** JavaScript/JSX is the final decision and matches the existing scaffold. An earlier discussion briefly mentioned TypeScript; that mention is superseded by the explicit JavaScript decision and current project configuration.

## 3. Users and account model

- A user can register with email/password or Google sign-in.
- Email registration requires verification. Users can request another verification email.
- Password reset uses a time-limited, single-use link.
- Users can sign in, sign out, and manage their account/session.
- All note and tag data is private to the authenticated user. Every server-side resource read and mutation enforces ownership.
- Users can permanently delete their account and associated notes, tags, authentication records, sessions, and user-scoped local recovery data after explicit confirmation and recent authentication.
- Logout is allowed even when local edits are pending. Warn the user, preserve recovery data scoped to the stable user ID, clear active session state and user-specific query caches, and never expose one user's local data to another user.

## 4. Functional requirements

### 4.1 Notes and editor

- A note has one plain-text title and one rich-text body. There are no separate note types.
- The editor opens directly in edit mode and focuses the body first for quick capture.
- The editor supports common formatting: bold, italic, headings, bulleted and numbered lists, blockquotes, inline code, and links. Common Markdown-style typing shortcuts are supported; this is not a raw Markdown editing mode.
- URLs may auto-link, and users can create links with custom display text. Only safe URL schemes are accepted; unsafe schemes such as `javascript:` are rejected.
- No images, attachments, embeds, or file uploads in the MVP.
- New notes remain drafts until the user enters meaningful title or body content.
- Autosave starts after **800 ms** without typing and also has a maximum wait so continuous input cannot defer a save indefinitely. Saves must be serialized or otherwise protected from out-of-order completion.
- The UI reports `Saving…`, `Saved`, or a persistent save error with Retry. `Saved` is shown only after server confirmation.
- On navigation, flush or await a pending save when possible. If save is in flight or failed, preserve the draft and ask before leaving; never silently discard unsaved content.
- Concurrent edits use a server-managed integer revision and atomic conditional updates. A stale revision returns a conflict. Preserve both server and local versions; the user chooses which version to keep. Never silently overwrite a newer revision.
- Saving an edit updates `updatedAt`; the note moves to the top of applicable lists. Update optimistically where safe, then reconcile with server results and pagination.
- A user can export an individual note as Markdown or plain text. Export is client-side where practical and does not modify the note or its timestamps.

### 4.2 Note lifecycle and organization

- Pinning changes the pin indicator and Home's Pinned group. It does not create a pin-prioritized Notes sort. The main Notes list remains ordered by `updatedAt`.
- Users can create, rename, and delete tags. Tags are independent user-owned resources and may remain unused until explicitly deleted. Names are normalized per user to prevent case-only duplicates.
- Users can apply multiple tags to a note and filter notes by tag.
- Archive removes a note from active Notes but retains it in Archive. Editing an archived note does not unarchive it; unarchive is explicit.
- Trash removes a note from active Notes and Archive. Trashed content is read-only until restored. Permanent deletion requires explicit confirmation.
- Account deletion permanently removes all associated data and user-scoped local recovery copies after explicit confirmation.

### 4.3 Home, lists, search, and navigation

- Home provides search entry, pinned notes, recent notes, frequent tags, and Create Note.
- Hide Home sections with no content. A user with no notes sees a short first-note empty state and a clear create action; no onboarding carousel, sample content, or templates in MVP.
- If the active Notes list is empty while archived or trashed notes exist, show a contextual empty state with links to those views.
- Notes, Archive, and Trash use compact cards and cursor-based infinite scrolling. Default page size is **30**, capped on the server.
- Search is debounced in the UI and performed server-side over title, derived plain text, and tag IDs/names. Preserve the query while browsing results. The initial search implementation is kept behind a replaceable interface; do not use unrestricted regex scans across the user's entire collection.
- Notes ordering is **`updatedAt DESC, _id DESC`** for deterministic cursor pagination. Pinned status does not change this ordering.
- Use TanStack Query `useInfiniteQuery` and an `IntersectionObserver` sentinel for automatic loading; prevent duplicate fetches, stop at the final page, and retain existing results if a later-page request fails. Provide Retry and consider a manual fallback if accessibility/reliability testing calls for it.
- Loading uses cached data when available and skeleton/shimmer placeholders when it is not. Respect reduced-motion preferences.
- Transient loading errors use bounded automatic retries, preserve displayed content, then present an inline error with manual Retry. Do not retry permanent validation or authorization errors indefinitely.
- Mobile navigation is Home, central Create, Notes, Settings in a bottom bar. Tags, Archive, and Trash are reached contextually.
- Desktop uses a compact sidebar and may use a Notes list/editor split view at wide breakpoints.

### 4.4 Theme, accessibility, and device support

- Theme choices: Light, Dark, System. Apply early enough to avoid a theme flash.
- Target WCAG 2.2 AA where applicable: semantic structure, keyboard access, visible focus, contrast, accessible dialog/sheet focus handling, screen-reader labels/status announcements, and comfortable touch targets.
- Respect `prefers-reduced-motion` for transitions and loading shimmer.
- The application is responsive and mobile-first. PWA/offline capabilities are delivered in a later phase, not assumed to be present in the first UI release.

## 5. Offline and recovery requirements

- Provide **limited offline resilience**, not a promise of full offline parity.
- Use IndexedDB for user-scoped local note snapshots/drafts and queued mutations needed to recover editing while disconnected.
- Clearly distinguish local/pending changes from server-confirmed saves. Reconcile queued writes after connectivity returns.
- Use revision checks when reconnecting. If the server has advanced, preserve the local draft and provide an explicit conflict resolution flow.
- Keep local recovery data isolated by stable user ID. Clear active caches on logout; only restore recovery copies after that same user signs in.
- Do not report success until a server write is confirmed.

## 6. Non-functional requirements

- **Privacy:** Never log note body/title, passwords, session tokens, OAuth secrets, or local recovery content. Redact sensitive values from errors and monitoring.
- **Forms and validation:** Use React Hook Form for interactive forms. Build reusable field adapters around shared accessible inputs and controls so feature forms do not repeat `Controller` wiring. Client validation improves feedback; server-side Zod validation remains authoritative.
- **Security:** Zod validation at API boundaries; server-side authentication and per-resource ownership checks; request-size and Lexical content validation; safe link handling; risk-appropriate rate limits on authentication, search, writes, and destructive actions; review CSRF protections for cookie-authenticated mutations.
- **API errors:** Stable structured errors for expected cases. Unexpected failures return a generic response with a request ID, with details only in protected server logs.
- **Data consistency:** Note content, content version, derived plain text, timestamps, and revision are updated together. Tag references remain stable across renames.
- **Database:** Start with essential user-scoped and query-aligned indexes; add indexes only with justified query patterns or measurements. Use backward-compatible schema changes and explicit migration scripts when existing data or indexes must change.
- **Operations:** Structured server logs with request IDs and privacy-preserving error monitoring/metrics. Configure managed Atlas backups, define RPO/RTO according to the selected plan, document recovery, and test a restore before production.
- **Quality:** Unit tests for domain rules, integration tests for Route Handlers/repositories/security, and end-to-end tests for critical journeys. CI runs lint, formatting, tests, build, and critical browser flows; Netlify deploy previews support review, and production deploys from protected `main` after checks pass.

## 7. Explicitly out of scope for MVP

- Collaboration, sharing, comments, public publishing, and multi-user workspaces.
- AI writing assistance.
- Images, attachments, embedded files, and uploads.
- Reminders or per-note notifications.
- Folders, nested hierarchy, and multiple note types.
- Version history UI or manual revision browsing.
- Full account export/import (individual note export is included).
- Complete offline parity or background sync guarantees beyond the recovery and queued-write scope above.
- Onboarding carousels, sample notes, and templates.

## 8. Acceptance criteria

The MVP is ready for release when a user can register/sign in securely; create, edit, autosave, recover, search, tag, pin, archive, trash, restore, permanently delete, and export notes; use light/dark/system themes; resolve stale-revision conflicts without losing either version; and use the core flows with keyboard and assistive technology. Ownership boundaries, privacy-safe logs, backups, test coverage of critical behaviors, and production deployment checks must be verified.

## 9. Known specification alignment item

The frozen pagination decision is `updatedAt DESC, _id DESC`. The current generated [`design/screen-specifications.md`](design/screen-specifications.md) says `_id ASC` in its ordering line. Align that design-spec line with this frozen requirement before implementation relies on it. The design brief's stable tie-breaker wording is otherwise compatible.
