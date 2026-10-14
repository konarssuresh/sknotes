# Notes App — Design Brief

## Product context

This is a **personal, mobile-first Notes application** built for two primary jobs:

1. **Capture notes quickly** — minimal friction from intent to writing.
2. **Retrieve notes easily** — search, recency, pins, and tags surface what matters.

The experience is inspired by the **simplicity** of Apple Notes but establishes its own visual identity: **Quiet Paper**. It is not a Notion clone, knowledge base, or workspace. There is **one entity: the Note**. No separate note types, templates, or document modes.

The production app uses Next.js App Router, JavaScript/JSX, Tailwind CSS, shadcn/ui, and Lexical for rich text. A standalone HTML/CSS/vanilla JS prototype will validate layouts and interactions using the same design tokens documented separately.

---

## Design principles

| Principle            | Intent                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Minimal**          | Every control earns its place. Prefer progressive disclosure (overflow menus, “More” in the editor) over visible complexity. |
| **Calm**             | Low visual noise: restrained color, soft borders, gentle elevation. The content is the hero.                                 |
| **Fast**             | Perceived speed through instant navigation, skeleton loading, and unobtrusive autosave feedback.                             |
| **Trustworthy**      | Clear save/sync status; predictable back navigation; destructive actions require confirmation.                               |
| **Touch-first**      | Comfortable targets, thumb-friendly bottom navigation, sheets on mobile.                                                     |
| **Density with air** | Compact note cards and lists without feeling cramped; generous padding on the editor reading column.                         |

---

## Visual identity: Quiet Paper

**Quiet Paper** evokes a clean notebook on a neutral desk: warm-cool neutral surfaces, typography-led hierarchy, and a single **brand accent** (soft blue-teal) for focus, primary actions, and active navigation. We do **not** use folder-yellow aesthetics, skeuomorphic leather textures, or heavy gradients.

**Typography** carries structure: bold titles, muted previews and metadata, comfortable body size in the editor. **Color** is mostly grayscale semantic tokens; accent appears on primary buttons, focus rings, active nav items, and selected tag filters. **Elevation** is subtle—hairline borders and light shadows in light mode; border emphasis in dark mode.

**Iconography** uses Lucide with consistent stroke weight. Pins and tags are small, legible indicators—not decorative chrome.

---

## Tone and motion

Motion supports orientation, not spectacle. Route changes use a brief fade; bottom sheets slide up (200–300ms). Respect **`prefers-reduced-motion`**: replace transforms with opacity-only transitions and disable non-essential animation.

Feedback is **quiet but visible**: save status in the editor header, inline list errors with Retry, toasts only for global failures (e.g. logout error).

---

## Accessibility

- **Contrast**: Body text and UI labels target WCAG 2.1 AA against their surfaces. Muted text remains readable for metadata, not for primary content.
- **Touch targets**: Minimum **44×44 CSS px** for interactive controls; list rows may be shorter visually if tap area extends via padding.
- **Focus**: Visible focus rings using `focus-ring` token; never remove outline without a replacement.
- **Screen readers**: Icon-only buttons have accessible names; save status uses a live region; lists use proper list semantics.
- **Keyboard**: Full keyboard operation on desktop; logical tab order in editor (title → body → toolbar).

---

## Information architecture

### Primary routes (always reachable)

| Route           | Role                                                    |
| --------------- | ------------------------------------------------------- |
| **Home**        | Hub: search entry, pins, recents, frequent tags, create |
| **Notes**       | Full searchable list, infinite scroll                   |
| **Note editor** | Create/edit a single note                               |
| **Settings**    | Theme, account entry, logout                            |

### Contextual routes (secondary navigation)

| Route       | Reachability                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| **Tags**    | Home (frequent tags), Notes (filter chip / link), Settings (optional link), desktop sidebar “Library” |
| **Archive** | Note overflow menu, Home footer link, desktop sidebar                                                 |
| **Trash**   | Note overflow menu, Settings, desktop sidebar                                                         |

### Mobile navigation

Bottom bar with four items: **Home**, **Create Note** (center, emphasized), **Notes**, **Settings**. Tags, Archive, and Trash are **not** bottom-nav items—they are reached from content and menus to avoid clutter.

### Desktop navigation

A **compact sidebar** (~240px) lists Home, Notes, Create, and a **Library** group (Tags, Archive, Trash), plus Settings at the bottom. The main area supports **master–detail** on large viewports (note list + editor side by side) while keeping the editor column at a comfortable reading width (see design tokens: `content-max`).

---

## Data and ordering (UX implications)

- Notes sort by **`updatedAt` descending**, with **`_id` as stable tie-breaker** everywhere lists appear.
- **Search** matches **title**, **body** (plain text derived from rich content), and **tags**.
- **Pinning** is an indicator and **Home grouping** only—not a separate sort mode on the Notes list.
- **Archived** notes remain archived when opened and edited; unarchive is explicit.
- **Trashed** notes are **read-only** in preview until restored.

---

## Lexical editor UX

- **Separate fields**: single-line **title** (plain text) and **rich-text body** (Lexical).
- **Opens in edit mode** immediately; **initial focus in the body** (not the title) to support quick capture.
- **Mobile formatting toolbar**: compact row—Bold, Italic, bullet list, numbered list, link; **More** opens a sheet with headings, strikethrough, and additional formats as needed for MVP.
- **Desktop**: same controls; toolbar may sit sticky below the header or inline above the body.
- **Overflow menu** (header): Pin, Tags, Archive, Move to Trash—plus Unarchive when viewing an archived note.

No images, attachments, or embeds in MVP.

---

## Autosave and sync status

Users always know whether their work is safe:

| State      | Presentation                                                  |
| ---------- | ------------------------------------------------------------- |
| **Saving** | Muted label “Saving…” with subtle progress indicator optional |
| **Saved**  | “Saved” or check icon; fades to low emphasis after ~2s        |
| **Error**  | “Couldn’t save” + **Retry**; persists until success           |

Placement: **editor header**, right of title area or below on very narrow screens. List views do not show per-note sync except after a failed background sync (optional badge—defer to implementation; not required in MVP UI unless error).

Debounced save after edits (recommended 500–800ms) is an implementation detail; the UI must reflect in-flight and failed states.

---

## MVP boundaries (out of scope)

Do not design or imply UI for:

- Images, attachments, file uploads
- Collaboration, sharing, comments
- AI writing assistance
- Reminders, notifications per note
- Folders or nested hierarchy (tags only)
- Version history or diff views
- Separate note types (checklist-only, drawing, etc.)
- Public publishing or URLs

---

## Anti-patterns

- Dashboard-style widgets unrelated to capture/retrieval
- Treating **pin** as a global sort tab on Notes
- Auto-unarchiving when user edits an archived note
- Editable trash preview (breaks trust and recovery)
- Heavy modals for every action—prefer sheets on mobile, dialogs on desktop for confirms
- Neon accents, dense multi-column mobile layouts, or competing primary CTAs on Home

---

## Prototype vs production

| Layer             | Approach                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Design tokens** | Defined in `design-tokens.md`; prototype uses CSS custom properties with the same names                      |
| **Prototype**     | Standalone HTML/CSS/JS; no framework; validates layout and interaction specs                                 |
| **Production**    | Tailwind + shadcn/ui mapped to tokens; Lexical for body; theme via `class` on `html` (light / dark / system) |

---

## Related documents

- [`design-tokens.md`](design-tokens.md) — semantic tokens and component recipes
- [`screen-specifications.md`](screen-specifications.md) — per-screen layout and states
- [`interaction-specifications.md`](interaction-specifications.md) — flows, transitions, and behavior
