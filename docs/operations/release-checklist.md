# Release checklist

Use this checklist before and after each production deploy from `main`. It complements [deploy.md](deploy.md), [environment.md](environment.md), [backups.md](backups.md), and [monitoring.md](monitoring.md).

## Pre-flight (before merging to `main` or before promoting Netlify production)

- [ ] **CI green** on the release commit: GitHub Actions `check` and `e2e` jobs (see [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)).
- [ ] **Local or CI parity:** `npm run ci` passes on the release branch.
- [ ] **Dependency audit:** `npm run audit:ci` reviewed; no unmitigated high/critical issues ([security-review.md](security-review.md)).
- [ ] **Netlify PR preview** smoke: sign-in, create/edit note, search, settings sign-out ([deploy.md](deploy.md)).
- [ ] **Environment:** production Netlify env vars match [environment.md](environment.md) (no secrets in git).
- [ ] **MongoDB indexes:** `npm run ensure-indexes` run against the target cluster after schema/index changes.
- [ ] **Atlas backups** enabled per operator tier; restore procedure understood ([backups.md](backups.md)).
- [ ] **Email:** Resend domain verified for production sending ([../integrations/resend-email.md](../integrations/resend-email.md)).
- [ ] **Accessibility:** no serious/critical axe violations on core routes ([../accessibility-audit.md](../accessibility-audit.md)); E2E a11y specs green.

### Optional manual checks (MVP)

- [ ] **Lighthouse (mobile)** on Home and note editor: performance and accessibility spot-check.
- [ ] **Slow network:** Chrome DevTools 3G throttling — sign-in, open editor, autosave, offline banner if applicable.

## Launch

- [ ] Merge PR to `main` (no direct pushes to `main`).
- [ ] Confirm Netlify **production** deploy for `main` succeeds.
- [ ] Smoke production URL: login, notes list, create note, logout.
- [ ] Confirm `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` match the live site origin.

## Post-launch (first 24 hours)

- [ ] Watch Netlify deploy logs and GitHub Actions on `main`.
- [ ] Sample application logs for errors; use request IDs per [monitoring.md](monitoring.md) when correlating issues.
- [ ] Confirm no unexpected spike in auth or API errors.

## Rollback

- [ ] **Netlify:** roll back to the previous production deploy in the Netlify UI ([deploy.md](deploy.md)).
- [ ] If a bad migration or data change shipped, follow [backups.md](backups.md) for restore (non-prod validation first).
- [ ] Document incident and follow-up in your team’s tracker.

## Operator setup (one-time, not in repo)

Configure in GitHub and Netlify dashboards:

| Item                            | Guidance                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Branch protection** on `main` | Require pull request before merge; require status checks `check` and `e2e`; disallow force-push |
| **Netlify production branch**   | `main`                                                                                          |
| **Deploy previews**             | Enabled for pull requests                                                                       |
| **Secrets**                     | Only in Netlify (and local `.env.local`); never commit                                          |

Record completion dates in your runbook when these are first enabled.

## Phase 7 exit gate

When this checklist is satisfied for the first production-ready release:

- CI + E2E + preview smoke documented above
- Operations docs under `docs/operations/`
- Accessibility audit on file
- Backup/restore documented for operators

Update [development-plan.md](../development-plan.md) if release scope changes.
