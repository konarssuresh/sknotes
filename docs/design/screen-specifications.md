# Notes App — Screen Specifications

This document defines layout hierarchy, components, responsive behavior, and UI states for each screen. Global patterns apply unless a screen overrides them.

**Ordering rule (all note lists):** `updatedAt` descending, then `_id` descending as tie-breaker.

**Search scope:** title, body (plain text), and tags.

---

## Global app shell

### Mobile (`< md`)

```
┌─────────────────────────────────┐
│ Screen header (optional)        │
├─────────────────────────────────┤
│                                 │
│ Main scroll region              │
│                                 │
├─────────────────────────────────┤
│ [Home] [ + ] [Notes] [Settings] │  ← bottom nav + center Create
└─────────────────────────────────┘
```

- Main content padding: `space-page-x`, `space-page-y`
- Bottom nav: fixed; content padding-bottom includes `bottom-nav-height` + safe-area
- Create control: center FAB-style in nav bar (see tokens)

### Desktop (`≥ md`)

```
┌──────────┬──────────────────────────────┐
│ Sidebar  │ Main                         │
│          │  (list | editor split @ lg)  │
│ Home     │                              │
│ Notes    │                              │
│ Create   │                              │
│ ─────    │                              │
│ Tags     │                              │
│ Archive  │                              │
│ Trash    │                              │
│ ─────    │                              │
│ Settings │                              │
└──────────┴──────────────────────────────┘
```

- Sidebar: `sidebar-width`, sticky full height
- At `lg+`, Notes route may show list + editor columns; editor respects `content-max`

### Shared header pattern

| Element  | Behavior                                          |
| -------- | ------------------------------------------------- |
| Title    | `title-lg`, left aligned                          |
| Leading  | Back chevron on editor and sub-screens            |
| Trailing | Context actions (overflow, save status on editor) |
| Search   | Expandable field or dedicated tap → search mode   |

### Accessibility (global)

- `main` landmark for scroll region; `nav` for bottom/side navigation
- Page title as `h1` per route (one per view)
- Note lists: `ul` / `li` or role="list" with accessible row labels (title + modified time)

---

## 1. Home

**Purpose:** Fast entry to capture, search, and recently used content.

### Hierarchy

```
h1: Home (or user greeting — optional "Notes")
[ Search bar — tap navigates to Notes search or inline expand ]

Section: Pinned          [See all → Notes filtered optional]
  → horizontal scroll (mobile) or 2-col grid (md+), max 5 pins
  → compact mini-cards: title + pin icon

Section: Recent
  → vertical list, max 10 notes, same card as Notes (compact)

Section: Frequent tags
  → chip row, max 8 tags by usage count

Footer links (text): Tags · Archive · Trash  (mobile contextual)

[ Empty state replaces sections when no notes exist ]
```

### Components

- **Search entry**: read-only styled input; placeholder “Search notes”
- **Pinned mini-card**: `title` truncate, no preview or 1-line preview optional
- **Note card**: see tokens (full card in Recent)
- **Tag chip**: tap → Notes with tag filter applied

### Responsive

| Viewport | Pinned layout                               |
| -------- | ------------------------------------------- |
| Mobile   | Horizontal scroll, card width ~72% viewport |
| md+      | Grid 2–3 columns within `list-max` centered |

### States

| State                | UI                                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Default**          | Sections with data                                                                                                                                                           |
| **Loading**          | Skeleton for search bar + 3 pin slots + 5 list rows                                                                                                                          |
| **Empty (new user)** | Illustration placeholder (abstract rectangle stack); headline “Your notes live here”; body copy; primary button “Create note”; secondary “Search” disabled until notes exist |
| **Error**            | Inline banner at top: “Couldn’t load notes” + Retry                                                                                                                          |
| **Partial**          | If pins fail but recents load, section-level error                                                                                                                           |

### Create action

Bottom nav center Create and empty-state CTA both open **new note editor**.

---

## 2. Notes

**Purpose:** Complete searchable catalog with infinite scroll.

### Hierarchy

```
Header: Notes
[ Search input — sticky below header on scroll optional ]

Optional: active filter chips (tag, archive N/A here)

List of note cards (infinite scroll)
```

### Note card content

| Field    | Spec                                          |
| -------- | --------------------------------------------- |
| Title    | `title`, 1 line; “Untitled” if empty          |
| Preview  | `body-sm` muted, 2-line clamp from plain body |
| Tags     | Up to 3 pills + overflow count                |
| Modified | Relative time (`caption`), e.g. “2h ago”      |
| Pin      | `pin-active` icon when pinned                 |

### Responsive

- Mobile: full-width cards, gap `space-2`
- md+: list centered `list-max`
- lg+: optional split pane when navigating from list (see interaction spec)

### States

| State                 | UI                                                 |
| --------------------- | -------------------------------------------------- |
| **Loading (initial)** | 8 skeleton cards                                   |
| **Loading (more)**    | Spinner or skeleton at list bottom                 |
| **Empty**             | “No notes yet” + Create note                       |
| **No results**        | “No matches for ‘{query}'” + Clear search          |
| **Error**             | Full-width error with Retry; preserve search query |
| **Disabled**          | N/A at list level                                  |

### Interactions (reference)

Tap row → editor. Pull-to-refresh reloads first page (mobile). Infinite scroll loads next page ~400px from end.

---

## 3. Note editor

**Purpose:** Capture and edit a single note; always editable (except trash preview uses different screen).

### Hierarchy

```
Header:
  [← Back]  [Save status: Saving | Saved | Error + Retry]  [⋯ menu]

Title input (plain, borderless, placeholder "Title")

Formatting toolbar (sticky above keyboard on mobile)
  B  I  •  1.  Link  [More]

Lexical body (min-height fills viewport below toolbar)

(Optional footer safe-area padding)
```

### Editor rules

- Opens **directly in edit mode**
- **Initial focus: body** (not title)
- Autosave on change; status in header (see design brief)

### Toolbar — mobile compact

| Control                | Action                                           |
| ---------------------- | ------------------------------------------------ |
| Bold, Italic           | Toggle                                           |
| Bullet / Numbered list | Toggle                                           |
| Link                   | Prompt or inline URL sheet                       |
| More                   | Bottom sheet: Heading 2, Strikethrough (MVP set) |

### Toolbar — desktop

Same controls in horizontal row; sticky below header.

### Overflow menu (⋯)

| Item          | Notes                           |
| ------------- | ------------------------------- |
| Pin / Unpin   | Toggle                          |
| Tags          | Opens sheet to add/remove tags  |
| Archive       | Moves to archive                |
| Move to Trash | Confirmation sheet/dialog       |
| Unarchive     | Shown only when note `archived` |

Editing an archived note **does not** remove archive flag.

### Responsive

- Body column max `content-max`, centered in main area
- Title and body share same horizontal padding `space-6`

### States

| State              | UI                                                      |
| ------------------ | ------------------------------------------------------- |
| **Loading**        | Skeleton title + body lines                             |
| **Saving**         | “Saving…” `caption` muted                               |
| **Saved**          | “Saved” then fade                                       |
| **Save error**     | “Couldn’t save” + Retry (destructive text optional)     |
| **Empty new note** | Placeholder title/body; still autosave on first content |
| **Error load**     | Full screen error + Back                                |

### Back navigation

If save in flight or last save failed, confirm before leave (see interaction spec).

---

## 4. Tags

**Purpose:** Browse, manage, and filter by tags.

### Hierarchy

```
Header: Tags                    [+ New tag]

List rows:
  Tag name (label)              Count (caption)   [⋯]
```

### Row actions (menu)

- Rename
- Delete (confirm if count > 0: warn that tag is removed from notes)
- Filter (same as tap row)

### Sort

Default: **alphabetical** by name; optional toggle by count (implementation detail—default alphabetical in MVP).

### Responsive

- Same list layout; on md+ optional two-column if >20 tags (not required MVP)

### States

| State               | UI                                  |
| ------------------- | ----------------------------------- |
| **Loading**         | Skeleton rows                       |
| **Empty**           | “No tags yet” + create CTA          |
| **Error**           | Banner + Retry                      |
| **Create/renaming** | Inline sheet/dialog with text field |

### Filter navigation

Tap tag → **Notes** screen with filter chip visible; chip dismiss clears filter.

---

## 5. Archive

**Purpose:** Access archived notes without mixing into main Notes list.

### Hierarchy

```
Header: Archive
[ Search — same as Notes, scoped to archived ]

Note cards (same as Notes) + "Archived" badge on card
```

### Card badge

Small `caption` pill: “Archived” using `foreground-muted` on `tag-bg`.

### Editor

Opening a card → **same editor**; overflow includes **Unarchive** instead of Archive.

### States

Same set as Notes: loading, empty (“No archived notes”), no results, error.

---

## 6. Trash

**Purpose:** Recovery and permanent deletion.

### Hierarchy

```
Header: Trash
[List of trashed notes — read-only preview rows]

Preview screen (on tap):
  Title (read-only text)
  Body (read-only rich render, no caret)
  Actions: [Restore] [Delete forever]
```

### List row

Same card layout but muted styling; no edit affordance (no “continue writing” hint).

### Preview actions

- **Restore**: returns note to active list, navigates to editor in edit mode
- **Delete forever**: confirm dialog/sheet → permanent removal

### States

| State                | UI                                 |
| -------------------- | ---------------------------------- |
| **Empty**            | “Trash is empty”                   |
| **Loading / Error**  | Same patterns as Notes             |
| **Disabled editing** | Body not focusable; toolbar hidden |

---

## 7. Settings

**Purpose:** Theme and account entry.

### Hierarchy

```
Header: Settings

Section: Appearance
  Theme: ( ) Light  ( ) Dark  ( ) System

Section: Account
  Row: Account → (placeholder destination)

Section: Library (mobile convenience)
  Tags | Archive | Trash  (chevron rows)

Section: Session
  Logout (destructive text or secondary button)
```

### Theme control

Segmented control on mobile; radio group on desktop. Immediate preview.

### States

| State              | UI                             |
| ------------------ | ------------------------------ |
| **Logout confirm** | Dialog/sheet if session active |
| **Error**          | Toast on logout failure        |

---

## Responsive summary table

| Screen          | Mobile                      | md (768+)           | lg (1024+)                |
| --------------- | --------------------------- | ------------------- | ------------------------- |
| Home            | Single column, pin carousel | Wider grids         | Optional max width        |
| Notes           | Full width list             | Centered list       | Split list + editor       |
| Editor          | Full screen                 | Full or split       | Split pane, `content-max` |
| Tags            | Full width                  | Centered `list-max` | Same                      |
| Archive / Trash | Full width                  | Centered `list-max` | Same                      |
| Settings        | Full width form             | Centered max 480px  | Same                      |

---

## State coverage matrix

| State      | Home | Notes | Editor | Tags | Archive | Trash         | Settings |
| ---------- | ---- | ----- | ------ | ---- | ------- | ------------- | -------- |
| Loading    | ✓    | ✓     | ✓      | ✓    | ✓       | ✓             | —        |
| Empty      | ✓    | ✓     | —      | ✓    | ✓       | ✓             | —        |
| Error      | ✓    | ✓     | ✓      | ✓    | ✓       | ✓             | ✓        |
| No results | —    | ✓     | —      | —    | ✓       | —             | —        |
| Disabled   | —    | —     | —      | —    | —       | ✓ (read-only) | —        |

---

## Related documents

- [`design-brief.md`](design-brief.md) — principles and MVP scope
- [`design-tokens.md`](design-tokens.md) — visual tokens and components
- [`interaction-specifications.md`](interaction-specifications.md) — flows and transitions
