# SKNotes — Technical Architecture

**Status:** Frozen MVP architecture, with integration checks required before dependent implementation  
**Language:** JavaScript/JSX, not TypeScript  
**Deployment:** Netlify + MongoDB Atlas

## 1. Architecture goals

- Keep the MVP in one deployable Next.js application while separating HTTP, use-case, domain, and persistence responsibilities.
- Treat MongoDB access and hosting APIs as replaceable infrastructure details.
- Protect private notes through server-side identity and ownership checks on every operation.
- Make autosave, cursor pagination, local recovery, and conflict resolution correct before optimizing.
- Use current stable Next.js App Router conventions, Server Components by default, and Client Components only where state, events, or browser APIs are needed.

## 2. System context

```text
Browser / installed PWA
  ├─ Next.js UI (Server Components + focused Client Components)
  ├─ TanStack Query: remote/server state and paged lists
  ├─ Zustand: shared client-only UI/editor state
  ├─ React Hook Form: form state, submission, and client validation lifecycle
  ├─ Shared form adapters: connect RHF fields to accessible UI building blocks
  ├─ Lexical: note body editor and serialized editor state
  └─ IndexedDB: user-scoped local drafts, snapshots, queued writes
          │ HTTPS
          ▼
Next.js App Router on Netlify
  ├─ Route Handlers: HTTP validation, auth/session, response mapping
  ├─ Application use cases: note, tag, search, export, account workflows
  ├─ Domain rules: ownership invariants, lifecycle, revisions
  ├─ Repositories: MongoDB operations
  └─ Better Auth integration
          │ server-side connection
          ▼
MongoDB Atlas
  ├─ Better Auth-managed identity/session collections
  ├─ notes
  └─ tags

Email provider / Google OAuth: Better Auth integrations, configured through secrets.
```

Netlify compatibility for the selected Next.js release, Better Auth's MongoDB adapter, email delivery, and Google OAuth must be proven in a small integration spike before production auth is built. Use Node-compatible server execution for MongoDB/auth. Do not depend on Edge runtime for database work. Keep application and repository layers portable from Netlify-specific APIs.

## 3. Repository and module boundaries

Use the existing JavaScript App Router scaffold and adapt names to the actual current Next.js conventions. A practical structure is:

```text
app/
  (auth)/login/page.js
  (auth)/sign-up/page.js
  (auth)/verify-email/page.js
  (auth)/forgot-password/page.js
  (app)/page.js
  (app)/notes/page.js
  (app)/notes/[noteId]/page.js
  (app)/tags/page.js
  (app)/archive/page.js
  (app)/trash/page.js
  (app)/settings/page.js
  api/auth/[...all]/route.js
  api/notes/route.js
  api/notes/[noteId]/route.js
  api/notes/[noteId]/export/route.js
  api/tags/route.js
  api/tags/[tagId]/route.js
  api/search/route.js
components/
  app-shell/ editor/ notes/ tags/ dialogs/ forms/ ui/
features/
  auth/ notes/ tags/ search/ offline/ export/
lib/
  auth/ db/ validation/ errors/ logging/
  repositories/ application/ domain/
```

The exact route tree is an implementation detail; keep public auth routes separate from authenticated app views. Avoid turning the suggested tree into abstraction for its own sake.

### Request path

1. Route Handler authenticates the request and parses query/body input with Zod.
2. Handler calls an application use case with the authenticated user ID and validated input.
3. Use case applies domain rules and calls a repository interface.
4. Mongo repository includes user ownership in its selectors and executes an atomic operation where required.
5. Handler maps result or stable API error to an HTTP response.
6. TanStack Query updates/refetches cached server state; local draft state is only reconciled after the result.

Components, Zustand stores, and editor plugins never access MongoDB directly.

## 4. State ownership

- **Server Components:** initial route shell and data that can be rendered securely on the server; avoid serializing secrets or full data unnecessarily.
- **TanStack Query:** authenticated API data, search/list pages, cache invalidation, optimistic updates with reconciliation, retry policy.
- **Zustand:** ephemeral app UI state shared between client components (open sheet, selected note UI, editor view state). Do not duplicate the full authoritative server cache in Zustand.
- **React Hook Form:** form values, submission lifecycle, field state, and client-side validation for forms such as sign-in, sign-up, password reset, tag creation/rename, and settings. Use Zod schemas/resolvers where appropriate; the server independently validates every request.
- **Lexical:** active rich-text editing state. Serialize to Lexical JSON for persistence.
- **IndexedDB:** durable local recovery drafts, optional cached note snapshots, and queued mutations scoped to user ID. Never treat browser storage as the server of record.
- **MongoDB Atlas:** authoritative user, note, and tag persistence.

## 5. Forms and reusable field architecture

Use React Hook Form for application forms. Keep presentational building blocks (for example `TextInput`, `PasswordInput`, `Textarea`, `Select`, and `Checkbox`) accessible and independent of form state. Add a reusable adapter such as `FormField`/`RHFField` that internally uses React Hook Form `Controller` or `useController` to bind a named field to a building block, forward value/change/blur/ref correctly, and consistently expose label, hint, disabled, invalid, and error-message semantics.

Feature forms should compose the shared adapter and declare their form schema/defaults/submit handler; they should not repeat `Controller` boilerplate for each field. Use `FormProvider`/context where it makes nested form composition simpler. Reserve direct `Controller` usage for genuinely exceptional controls that the adapter cannot represent, and document why. Do not create a broad HOC abstraction that obscures field behavior.

Validation should be consistent and layered: client-side schema validation gives fast feedback, while Route Handlers always validate again with Zod before executing a use case. Client validation never replaces server validation or authorization. Keep field errors associated with controls using `aria-invalid`, `aria-describedby`, and stable error IDs, and ensure keyboard and screen-reader behavior.

## 6. Authentication and authorization

Better Auth owns identity, credentials/OAuth integration, verification/reset flows, and session lifecycle. Validate MongoDB support and Netlify runtime behavior first. Configure secrets only in environment settings; no secret enters client bundles.

- Email/password registration and login, Google sign-in, email verification/resend, password reset, session refresh, and logout.
- Protect app routes and every private Route Handler. UI route protection is convenience only; API authorization is mandatory.
- Resolve stable user identity from the validated session on the server. Never trust a client-supplied `userId`.
- Every note/tag query and mutation includes the session user's ID. Use a not-found response where that avoids disclosing another user's resource existence.
- Rate-limit auth, search, writes, and destructive operations. Apply request-size limits and shared input validation.
- Review CSRF behavior for cookie-authenticated state changes.
- Logout clears active query caches and editor state; recovery data remains isolated by user ID and can only be restored after the same user signs in.
- Account deletion requires recent authentication and explicit confirmation, then removes all account-associated application and auth data and local recovery data.

## 7. Data model

The following are logical document shapes; Better Auth owns its own required collections/fields. Use MongoDB ObjectIds or the chosen stable ID representation consistently.

### User

Authentication identity/profile/session data managed by Better Auth. Application authorization uses its stable user ID.

### Note

```js
{
  _id,
  userId,
  title,                 // plain text, separately stored
  content,               // serialized Lexical editor state (source of truth)
  contentVersion,        // Lexical schema/version for migration
  plainText,             // server-derived preview/search projection
  tagIds: [],            // stable references to Tag documents
  pinned: false,
  status: "active",      // active | archived | trashed; mutually exclusive
  revision: 1,            // integer, server-managed
  createdAt,
  updatedAt
}
```

Keep lifecycle state mutually exclusive (or enforce equivalent invariants if separate booleans are used). A trashed note is read-only except for restore/permanent delete. Editing an archived note preserves archived status. `plainText` is derived and updated atomically with `content`; do not trust a client-supplied projection without validation/derivation. Every update that changes persisted note state increments revision and updates `updatedAt`, including tag, pin, and lifecycle changes according to the product's timestamp rule.

### Tag

```js
{
  (_id,
    userId,
    name, // display name
    normalizedName, // canonical, case-insensitive uniqueness key
    createdAt,
    updatedAt);
}
```

Notes reference stable tag IDs so rename does not rewrite each note. Keep unused tags until explicit deletion. Enforce unique `{ userId, normalizedName }`.

### Index strategy

Start with essential indexes tied to known queries:

- Notes user + status + `updatedAt DESC` + `_id DESC` for active/archive/trash pagination; validate whether partial indexes or separate status-specific indexes best fit the final queries.
- User-scoped note lookup and ownership predicates.
- Unique tags `{ userId: 1, normalizedName: 1 }`.
- Add search-specific indexes only after the chosen matching semantics and query plans are measured. Do not assume a normal B-tree makes arbitrary substring search fast.

Schema evolution uses backward-compatible code changes and explicit migration scripts for existing documents or index changes. Version Lexical content and migrate it deliberately.

## 8. API contracts

Use App Router Route Handlers; API path examples below are a logical contract, not a requirement to build a generic REST framework.

| Method and path                                      | Purpose                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `POST /api/auth/...`                                 | Better Auth-managed sign-up/sign-in/OAuth/session actions                   |
| `GET /api/notes?status=active&cursor=…&limit=30`     | List page; server caps limit at 30; cursor contains sort timestamp and ID   |
| `POST /api/notes`                                    | Create note after first meaningful content or explicit server-backed create |
| `GET /api/notes/:id`                                 | Get owned note and revision                                                 |
| `PATCH /api/notes/:id`                               | Update title/content/tags/pin/status with `expectedRevision`                |
| `DELETE /api/notes/:id`                              | Permanently delete trashed note only, with explicit confirmation in UI      |
| `GET /api/notes/:id/export?format=markdown           | text`                                                                       | Export one owned note |
| `GET/POST /api/tags`                                 | List/create current user's tags                                             |
| `PATCH/DELETE /api/tags/:id`                         | Rename or delete an owned tag                                               |
| `GET /api/search?q=…&tagId=…&status=active&cursor=…` | Server search with user scope and cursor pagination                         |

All inputs, cursors, formats, and Lexical payloads are validated. Expected failures use stable codes. Unexpected errors return a generic message and request ID. Never return stack traces, database details, or sensitive note content in error responses.

### Conditional revision update

For a note mutation, MongoDB must atomically match `_id`, `userId`, and `expectedRevision`; apply allowed changes; set server-derived `plainText` and `updatedAt`; and increment `revision`. If no match occurs, distinguish not-found/ownership from stale revision without leaking resource information. Return `409` for a known stale revision and include enough safe metadata to begin conflict resolution.

### Pagination and search

- Sort by `{ updatedAt: -1, _id: -1 }` and encode both values in an opaque cursor.
- Fetch 30 items by default with a server-enforced maximum.
- Query keys include search text, tag/status filters, and relevant user identity boundary; clear user-scoped caches on logout/account change.
- Search interface is replaceable. Initial implementation performs safe server-side matching over title, `plainText`, and tag references/names without unrestricted whole-collection regex scans. Validate behavior against realistic data before selecting a search index/service.

## 9. Autosave, offline recovery, and conflict flow

1. Lexical/title edits update local editor state immediately.
2. Preserve a user-scoped recovery draft locally before relying on the network.
3. Debounce a mutation by 800 ms and enforce a maximum wait for continuous typing.
4. Serialize or safely order pending saves; send expected revision.
5. Show Saving while pending. Mark Saved only after the server confirms the latest payload/revision.
6. Retry transient network/server failures with bounded policy while preserving the local draft; expose manual Retry.
7. Queue eligible writes in IndexedDB while offline; clearly mark them as pending and do not claim server persistence.
8. On reconnect, submit against the last known revision. On `409`, retain local and server copies and ask the user which to keep. If local wins, apply it against the latest revision after explicit choice.
9. Reconcile list/search caches after successful writes; server order and membership are authoritative.
10. On logout, warn about pending local changes, clear active state and query caches, and retain recovery only under that user's stable ID.

## 10. Security, privacy, and operations

- Keep database URLs, auth secrets, Google credentials, and email-provider secrets in server-only environment variables.
- Apply Zod schemas to body/query/cursor inputs, validate Lexical structure/size, and reject unsafe link protocols.
- Include ownership in each repository selector; do not fetch by ID and authorize later in the UI.
- Rate-limit authentication, search, writes, and destructive actions.
- Structured logs include request IDs, error categories, endpoint, and timing; exclude note/title content, passwords, tokens, and recovery copies.
- Monitor client/server failures and operational metrics (latency, auth failures, autosave/sync failures) with data minimization.
- Use Atlas managed backups supported by the selected plan. Define RPO/RTO from the actual plan, document recovery, and test restore before production.
- Use Netlify deploy previews for review and protected `main` for production. Avoid relying on platform-specific code outside deployment adapters/configuration.

## 11. Known design alignment

The source-of-truth cursor order is `updatedAt DESC, _id DESC`; the generated screen spec currently has `_id ASC`. Align the design document before production list implementation. The SKNotes brand and auth pages must also be reflected in the prototype and production route design. The standalone prototype remains mock-only and is never the production auth implementation.
