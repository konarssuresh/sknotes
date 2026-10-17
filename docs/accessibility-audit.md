# Accessibility audit (Phase 7 PR4)

**Target:** WCAG 2.2 Level AA on primary user flows ([`requirements.md`](requirements.md) §8).  
**Tooling:** [axe-core](https://github.com/dequelabs/axe-core) via `@axe-core/playwright` in [`tests/e2e/a11y-public.spec.mjs`](../tests/e2e/a11y-public.spec.mjs) and [`tests/e2e/a11y-authenticated.spec.mjs`](../tests/e2e/a11y-authenticated.spec.mjs).  
**Gate:** No **critical** or **serious** axe violations on audited routes (automated).

## Routes audited (automated)

| Route       | Auth      | Status             |
| ----------- | --------- | ------------------ |
| `/login`    | Public    | Covered by E2E axe |
| `/sign-up`  | Public    | Covered by E2E axe |
| `/` (Home)  | Signed-in | Covered by E2E axe |
| `/notes`    | Signed-in | Covered by E2E axe |
| `/settings` | Signed-in | Covered by E2E axe |
| `/tags`     | Signed-in | Covered by E2E axe |

**Not yet in CI axe suite (manual spot-check recommended):** `/notes/new`, `/notes/[noteId]`, `/archive`, `/trash`, auth recovery pages. Editor modals (leave, conflict, tags sheet) were updated for focus management; re-check with keyboard when changing those flows.

## Fixes in this PR

| Area          | Issue                                                                       | Fix                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Modals        | Focus could escape dialogs (leave, conflict, confirm, sign-out, tags sheet) | [`ModalShell`](../components/a11y/modal-shell.jsx) + [`useFocusTrap`](../lib/a11y/use-focus-trap.js)                                |
| Save status   | AT might miss autosave state changes                                        | `role="status"` on editor save labels; existing `aria-live="polite"` region retained                                                |
| Contrast      | Muted helper text below AA on some surfaces                                 | Darkened light-theme `--muted-foreground`; lightened dark-theme token in [`globals.css`](../app/globals.css)                        |
| Touch targets | Create control in bottom nav FAB slightly under 44px                        | FAB container `size-11` (44px) in [`bottom-nav.jsx`](../components/app-shell/bottom-nav.jsx)                                        |
| Motion        | List animations when user prefers reduced motion                            | Already gated via `useReducedMotion` in [`animated-presence.jsx`](../components/motion/animated-presence.jsx); covered by unit test |

## Known limitations / follow-ups

- **Automated axe** does not replace screen reader or mobile VoiceOver/TalkBack passes.
- **Lexical editor** toolbar and contenteditable region may report moderate axe rules; address in a focused editor pass if manual testing finds blockers.
- **Color contrast** on tag pills and chart tokens was not exhaustively re-audited; re-run axe after major theme changes.

## How to re-run

```bash
CI=true npm run test:e2e:ci -- tests/e2e/a11y-public.spec.mjs tests/e2e/a11y-authenticated.spec.mjs
```

Full suite: `CI=true npm run test:e2e:ci`.
