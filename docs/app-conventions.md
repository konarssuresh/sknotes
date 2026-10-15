# SKNotes — Application conventions

Production Next.js App Router conventions for implementers. Product behavior remains in [`requirements.md`](requirements.md) and [`architecture.md`](architecture.md).

## Route groups and URLs

| Group    | Purpose                                                            | Phase 1                            |
| -------- | ------------------------------------------------------------------ | ---------------------------------- |
| `(app)`  | Signed-in experience with app shell (route protection in Phase 2+) | Implemented with placeholder pages |
| `(auth)` | Login, sign-up, verify, password reset—no app shell                | Implemented (Phase 2)              |

### `(app)` routes (public URLs)

| Path              | Page file (planned / current)      |
| ----------------- | ---------------------------------- |
| `/`               | `app/(app)/page.js` — Home         |
| `/notes`          | `app/(app)/notes/page.js`          |
| `/notes/[noteId]` | `app/(app)/notes/[noteId]/page.js` |
| `/tags`           | `app/(app)/tags/page.js`           |
| `/archive`        | `app/(app)/archive/page.js`        |
| `/trash`          | `app/(app)/trash/page.js`          |
| `/settings`       | `app/(app)/settings/page.js`       |

### Future `(auth)` routes (Phase 2)

| Path               | Planned file                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| `/login`           | `app/(auth)/login/page.js`                                                      |
| `/sign-up`         | `app/(auth)/sign-up/page.js`                                                    |
| `/verify-email`    | `app/(auth)/verify-email/page.js` — check your email, resend, and link outcomes |
| `/forgot-password` | `app/(auth)/forgot-password/page.js`                                            |

API Route Handlers live under `app/api/` (`app/api/auth/[...all]/route.js`, `app/api/notes/…`, account deletion). Tags and search routes arrive in later phases.

Signed-in note editing uses `/notes/new` for local drafts and `/notes/[noteId]` for persisted notes. The `(app)` layout wraps TanStack Query via `components/providers/query-provider.jsx`.

## Next.js file conventions

Follow Next.js 16 App Router special files (see `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`):

- `layout.js` — shared UI wrapping child segments
- `page.js` — routable UI
- `loading.js` — Suspense fallback
- `error.js` — segment error boundary (client component)
- `not-found.js` — 404 UI

Use private folders `_folder` for colocated non-route code inside `app/` when helpful.

## Module layout

```text
app/           # routes and route-local UI only where colocation helps
components/    # shared UI: app-shell/, forms/, ui/ (shadcn)
features/      # domain-specific UI modules (later phases)
lib/           # shared non-UI: validation, theme helpers, email (Resend), utilities
hooks/         # shared React hooks
tests/
  unit/        # Vitest + Testing Library
  integration/ # reserved for Route Handler tests (Phase 2+)
```

## Imports

Path alias `@/*` maps to the project root ([`jsconfig.json`](../jsconfig.json)):

- `@/components/...`
- `@/lib/...`
- `@/hooks/...`

## Server vs client components

- **Default:** Server Components (no `"use client"`).
- **Client:** interactive shell nav, theme controls, React Hook Form, and other event/browser state.

Do not import server-only modules (database, secrets) into client components.

## Forms

- Presentational fields live in `components/forms/fields/`.
- Feature forms compose `components/forms/rhf-field.jsx` instead of repeating `Controller` wiring.
- Client Zod schemas live beside features or under `lib/validation/`; server Zod validation remains authoritative on API boundaries (Phase 2+).

## Tooling note (JavaScript app)

Application source is JavaScript/JSX only. `typescript` is a **devDependency** for `eslint-config-next`; it is not used to compile the app.

## Theme

- Class-based light/dark on `<html>` via `next-themes` and a blocking inline script (anti-flash).
- Storage key: `sknotes-theme` (`light` | `dark` | `system`) in `localStorage`.

## Testing

| Command              | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `npm test`           | Unit tests (Vitest, single run)               |
| `npm run test:watch` | Vitest watch mode                             |
| `npm run ci`         | lint + format check + test + production build |

Integration and E2E suites are added in later phases per [`development-plan.md`](development-plan.md).

## Deploy / Netlify preview

- Build command: `npm run build` (see [`netlify.toml`](../netlify.toml)).
- Uses `@netlify/plugin-nextjs` for the Next.js runtime on Netlify.
- **Requires your Netlify account:** link the Git repository to a Netlify site, set Node version (LTS), and configure environment variables from [`.env.example`](../.env.example) in the Netlify UI—never commit secrets.
- PR deploy previews are enabled from the Netlify site settings after the repo is connected; this cannot be verified from the repo alone.

## Prototype boundary

[`docs/design/prototype/`](design/prototype/) is a standalone HTML/JS reference. Do not import prototype scripts or styles into the Next.js app.
