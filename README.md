# SKNotes

Personal, mobile-first notes app (Quiet Paper design). Production app: Next.js App Router, JavaScript, Tailwind CSS, and shadcn/ui.

## Documentation

- [Product requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Development plan](docs/development-plan.md)
- [Resend email setup](docs/integrations/resend-email.md) — verification and password reset (Phase 3)
- [App conventions](docs/app-conventions.md) — routes, modules, testing, deploy
- [Operations](docs/operations/) — environment, deploy, backups, monitoring, security, [release checklist](docs/operations/release-checklist.md)

Design specs live under [`docs/design/`](docs/design/). The HTML prototype is reference-only.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Development server                                                                                |
| `npm run build`        | Production build                                                                                  |
| `npm run start`        | Start production server                                                                           |
| `npm run lint`         | ESLint                                                                                            |
| `npm run lint:fix`     | ESLint with auto-fix                                                                              |
| `npm run format`       | Prettier write                                                                                    |
| `npm run format:check` | Prettier check                                                                                    |
| `npm test`             | Unit tests (Vitest)                                                                               |
| `npm run test:watch`   | Vitest watch                                                                                      |
| `npm run ci`           | lint + format:check + test + build                                                                |
| `npm run audit:ci`     | `npm audit` (high severity and above) — see [security-review](docs/operations/security-review.md) |

## Environment

Copy [`.env.example`](.env.example) to `.env.local` when implementing backend/auth (Phase 2+). Do not commit real secrets.

## Deploy

Netlify configuration is in [`netlify.toml`](netlify.toml). Connect the repository in Netlify and set environment variables in the dashboard before preview/production deploys.
