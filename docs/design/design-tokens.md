# Notes App — Design Tokens

Semantic tokens are the single source of truth for color, type, space, and component styling. Production maps these to shadcn CSS variables in `app/globals.css`; the HTML prototype uses the same names as CSS custom properties.

**Color format**: OKLCH values below for precision; implementers may round for CSS. Light and dark columns are required for every color token.

---

## Color

### Surfaces and text

| Token              | Light                   | Dark                    | Usage                              |
| ------------------ | ----------------------- | ----------------------- | ---------------------------------- |
| `background`       | `oklch(0.99 0.002 250)` | `oklch(0.14 0.01 250)`  | App canvas, editor backdrop        |
| `surface`          | `oklch(1 0 0)`          | `oklch(0.19 0.01 250)`  | Cards, list rows, inputs           |
| `surface-elevated` | `oklch(1 0 0)`          | `oklch(0.22 0.012 250)` | Popovers, sheets, dialogs          |
| `foreground`       | `oklch(0.18 0.02 250)`  | `oklch(0.97 0.005 250)` | Primary text                       |
| `foreground-muted` | `oklch(0.48 0.02 250)`  | `oklch(0.65 0.02 250)`  | Previews, timestamps, hints        |
| `border`           | `oklch(0.90 0.01 250)`  | `oklch(1 0 0 / 12%)`    | Card edges, dividers               |
| `border-subtle`    | `oklch(0.94 0.008 250)` | `oklch(1 0 0 / 8%)`     | Inset sections, toolbar separators |

### Brand and interactive

| Token                     | Light                        | Dark                         | Usage                              |
| ------------------------- | ---------------------------- | ---------------------------- | ---------------------------------- |
| `accent-brand`            | `oklch(0.52 0.12 220)`       | `oklch(0.72 0.11 220)`       | Primary buttons, active nav, links |
| `accent-brand-foreground` | `oklch(0.99 0 0)`            | `oklch(0.14 0.02 250)`       | Text on brand fills                |
| `accent-brand-muted`      | `oklch(0.94 0.04 220)`       | `oklch(0.28 0.06 220)`       | Selected tag filter background     |
| `focus-ring`              | `oklch(0.52 0.12 220 / 45%)` | `oklch(0.72 0.11 220 / 50%)` | Focus outline                      |

### Semantic status

| Token                    | Light                  | Dark                   | Usage                               |
| ------------------------ | ---------------------- | ---------------------- | ----------------------------------- |
| `destructive`            | `oklch(0.55 0.2 25)`   | `oklch(0.65 0.18 25)`  | Delete forever, destructive buttons |
| `destructive-foreground` | `oklch(0.99 0 0)`      | `oklch(0.14 0 0)`      | Text on destructive                 |
| `success`                | `oklch(0.55 0.14 145)` | `oklch(0.68 0.12 145)` | Saved confirmation (optional icon)  |
| `warning`                | `oklch(0.75 0.15 85)`  | `oklch(0.78 0.12 85)`  | Rare warnings (non-blocking)        |

### Overlays

| Token     | Light                       | Dark                    | Usage                    |
| --------- | --------------------------- | ----------------------- | ------------------------ |
| `overlay` | `oklch(0.2 0.02 250 / 40%)` | `oklch(0.05 0 0 / 55%)` | Modal scrim              |
| `scrim`   | same as `overlay`           | same                    | Alias for sheets/dialogs |

### Note-specific

| Token               | Light                  | Dark                   | Usage                               |
| ------------------- | ---------------------- | ---------------------- | ----------------------------------- |
| `tag-bg`            | `oklch(0.96 0.02 250)` | `oklch(0.26 0.02 250)` | Tag pill background                 |
| `tag-text`          | `oklch(0.35 0.03 250)` | `oklch(0.88 0.02 250)` | Tag label                           |
| `tag-bg-selected`   | `accent-brand-muted`   | `accent-brand-muted`   | Active tag filter                   |
| `tag-text-selected` | `accent-brand`         | `accent-brand`         | Active tag filter text              |
| `pin-active`        | `oklch(0.55 0.12 85)`  | `oklch(0.78 0.1 85)`   | Pinned icon (warm amber, not brand) |

### Disabled

| Token                 | Light                  | Dark                   | Usage                        |
| --------------------- | ---------------------- | ---------------------- | ---------------------------- |
| `disabled-foreground` | `oklch(0.65 0.01 250)` | `oklch(0.45 0.01 250)` | Disabled labels              |
| `disabled-opacity`    | `0.45`                 | `0.45`                 | Applied to disabled controls |

---

## Typography

### Font families

| Token       | Value                                        | Usage                                        |
| ----------- | -------------------------------------------- | -------------------------------------------- |
| `font-sans` | Geist Sans (production: `--font-geist-sans`) | All UI and note content                      |
| `font-mono` | Geist Mono                                   | Timestamps in debug-only contexts (optional) |

Prototype fallback stack: `system-ui, -apple-system, "Segoe UI", sans-serif`.

### Scale

| Token      | Size             | Line height | Weight | Usage                                |
| ---------- | ---------------- | ----------- | ------ | ------------------------------------ |
| `display`  | 28px / 1.75rem   | 1.2         | 600    | Empty states, welcome                |
| `title-lg` | 22px / 1.375rem  | 1.25        | 600    | Screen titles                        |
| `title`    | 17px / 1.0625rem | 1.3         | 600    | Note card titles, editor title input |
| `body`     | 16px / 1rem      | 1.5         | 400    | Editor body, list body preview       |
| `body-sm`  | 14px / 0.875rem  | 1.45        | 400    | Secondary copy                       |
| `caption`  | 12px / 0.75rem   | 1.35        | 400    | Timestamps, save status              |
| `label`    | 13px / 0.8125rem | 1.3         | 500    | Form labels, section headers         |

Note title input uses `title` weight 600; editor body uses `body` weight 400.

### Letter spacing

- `title` and `title-lg`: `-0.01em`
- `caption` and `label`: `0.01em` for uppercase section labels only (optional)

---

## Spacing

Base unit: **4px**. Semantic aliases reference the scale.

| Token      | Value | Usage                           |
| ---------- | ----- | ------------------------------- |
| `space-0`  | 0     | —                               |
| `space-1`  | 4px   | Tight inline gaps               |
| `space-2`  | 8px   | Icon gaps, tag padding          |
| `space-3`  | 12px  | Card internal padding (compact) |
| `space-4`  | 16px  | Default page horizontal padding |
| `space-5`  | 20px  | Section gaps                    |
| `space-6`  | 24px  | Editor padding                  |
| `space-8`  | 32px  | Section separation              |
| `space-10` | 40px  | Empty state vertical padding    |
| `space-12` | 48px  | Large section breaks            |

| Semantic        | Maps to                             | Usage                 |
| --------------- | ----------------------------------- | --------------------- |
| `space-page-x`  | `space-4` (mobile), `space-6` (md+) | Horizontal page inset |
| `space-page-y`  | `space-4`                           | Vertical list padding |
| `space-section` | `space-6`                           | Between Home sections |
| `space-card`    | `space-3`                           | Note card padding     |
| `space-inline`  | `space-2`                           | Chips, metadata row   |

Safe areas: add `env(safe-area-inset-*)` to bottom nav and sheet padding.

---

## Border radii

| Token         | Value  | Usage                    |
| ------------- | ------ | ------------------------ |
| `radius-xs`   | 4px    | Tags, small chips        |
| `radius-sm`   | 6px    | Inputs, buttons sm       |
| `radius-md`   | 10px   | Cards, buttons default   |
| `radius-lg`   | 14px   | Sheets, large cards      |
| `radius-xl`   | 18px   | Bottom sheet top corners |
| `radius-full` | 9999px | Pills, FAB               |

**Component defaults**

- Note list card: `radius-md`
- Button: `radius-md` (sm: `radius-sm`)
- Search input: `radius-md`
- Dialog: `radius-lg`
- Bottom sheet: `radius-xl` top only

Production shadcn base radius: `--radius: 0.625rem` (10px)—align `radius-md` with this.

---

## Shadows and borders

| Token          | Light                                 | Dark                            |
| -------------- | ------------------------------------- | ------------------------------- |
| `shadow-sm`    | `0 1px 2px oklch(0.2 0.02 250 / 6%)`  | none (use border)               |
| `shadow-md`    | `0 4px 12px oklch(0.2 0.02 250 / 8%)` | `0 4px 12px oklch(0 0 0 / 35%)` |
| `border-width` | 1px                                   | 1px                             |
| `border-style` | solid                                 | solid                           |

Elevated surfaces in dark mode rely on **border** + slight background step, not heavy shadow.

---

## Layout

| Token               | Value                         | Usage                         |
| ------------------- | ----------------------------- | ----------------------------- |
| `breakpoint-sm`     | 640px                         | Large phones, small tablets   |
| `breakpoint-md`     | 768px                         | Tablet / sidebar threshold    |
| `breakpoint-lg`     | 1024px                        | Master–detail                 |
| `breakpoint-xl`     | 1280px                        | Wide desktop                  |
| `content-max`       | 680px                         | Editor column max width       |
| `list-max`          | 720px                         | Centered list on wide screens |
| `sidebar-width`     | 240px                         | Desktop nav                   |
| `bottom-nav-height` | 56px + safe-area              | Mobile tab bar                |
| `header-height`     | 48px (mobile), 56px (desktop) | Screen headers                |
| `toolbar-height`    | 44px                          | Editor formatting bar         |

---

## Z-index

| Token      | Value | Usage                   |
| ---------- | ----- | ----------------------- |
| `z-base`   | 0     | Content                 |
| `z-sticky` | 10    | Sticky headers, toolbar |
| `z-nav`    | 20    | Bottom nav, sidebar     |
| `z-sheet`  | 40    | Bottom sheets           |
| `z-dialog` | 50    | Modals                  |
| `z-toast`  | 60    | Toasts                  |

---

## Motion

| Token             | Value                          | Usage                             |
| ----------------- | ------------------------------ | --------------------------------- |
| `duration-fast`   | 120ms                          | Hover, focus                      |
| `duration-normal` | 200ms                          | Fade, opacity                     |
| `duration-slow`   | 280ms                          | Sheet slide                       |
| `ease-standard`   | `cubic-bezier(0.2, 0, 0, 1)`   | Most transitions                  |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1.2)` | Sheet (subtle overshoot optional) |

**Reduced motion**: set all durations to `0ms` or use opacity-only; disable sheet slide transform.

---

## Icons

- **Library**: Lucide (production: `lucide-react`)
- **Default size**: 20px (`size-5`)
- **Navigation**: 24px (`size-6`)
- **Stroke**: 1.75 (default Lucide)
- **Naming**: prefer outlined variants; filled only for active nav if needed

Common icons: `Home`, `FileText` or `StickyNote`, `Plus`, `Settings`, `Search`, `Pin`, `Tag`, `Archive`, `Trash2`, `ChevronLeft`, `MoreHorizontal`, `Bold`, `Italic`, `List`, `ListOrdered`, `Link`, `Check`, `AlertCircle`, `RotateCw` (retry).

---

## Component style recipes

### Button

| Variant     | Background     | Text                      | Border   |
| ----------- | -------------- | ------------------------- | -------- |
| Primary     | `accent-brand` | `accent-brand-foreground` | none     |
| Secondary   | `surface`      | `foreground`              | `border` |
| Ghost       | transparent    | `foreground`              | none     |
| Destructive | `destructive`  | `destructive-foreground`  | none     |

| Size    | Height | Padding X | Font      |
| ------- | ------ | --------- | --------- |
| sm      | 36px   | 12px      | `body-sm` |
| default | 44px   | 16px      | `body-sm` |
| lg      | 48px   | 20px      | `body`    |

Icon-only: square, same heights; 44px default on mobile.

**States**: hover slightly darkens fill (light) or lightens (dark); disabled uses `disabled-opacity` + `disabled-foreground`; focus uses `focus-ring` 2px offset.

### Input / Search

- Height: 44px
- Padding: `space-3` horizontal
- Background: `surface`; border `border`; radius `radius-md`
- Focus: border `accent-brand` + `focus-ring`
- Search: leading search icon; trailing clear when non-empty

### Note card (list row)

- Background `surface`, border `border`, radius `radius-md`, padding `space-card`
- Title: `title`, single line truncate
- Preview: `body-sm`, `foreground-muted`, **2 lines** clamp
- Footer row: tags (max 3 visible + “+N”), timestamp `caption`, pin icon when pinned
- Min tap height: 44px (expand hit area vertically)

### Tag

- Pill: `tag-bg`, `tag-text`, `radius-full`, padding `space-1` `space-2`, `caption`/`label`
- Selected filter: `tag-bg-selected`, `tag-text-selected`

### Dialog vs bottom sheet

| Context          | Pattern                                                     |
| ---------------- | ----------------------------------------------------------- |
| Mobile (`< md`)  | Bottom sheet for confirms, tag picker, More formats         |
| Desktop (`≥ md`) | Centered dialog, max-width 400px (confirm) or 480px (forms) |

### Navigation

**Mobile bottom nav**

- Height `bottom-nav-height`; background `surface-elevated`; top border `border`
- Items: icon + optional label `caption`
- Active: `accent-brand` icon/label; inactive `foreground-muted`
- **Create**: center item—larger `accent-brand` circular button (56px) overlapping bar slightly (+2px)

**Desktop sidebar**

- Width `sidebar-width`; background `surface`; border-right `border`
- Item row: 40px height, `radius-sm`, active bg `accent-brand-muted`, active text `accent-brand`

### Loading, empty, error, disabled

| State        | Treatment                                                                       |
| ------------ | ------------------------------------------------------------------------------- |
| **Loading**  | Skeleton blocks matching card layout; shimmer optional (respect reduced motion) |
| **Empty**    | `display`/`title-lg` heading, `body-sm` muted description, primary CTA          |
| **Error**    | Banner `destructive` muted bg or inline row with message + Retry button         |
| **Disabled** | `disabled-opacity`; no pointer events                                           |

---

## Appendix: shadcn / Tailwind mapping

Use this when implementing with existing `app/globals.css` variables. Brand accent may be introduced by setting `--primary` to match `accent-brand` in a future theme pass.

| Semantic token            | shadcn CSS variable                | Tailwind utility (typical) |
| ------------------------- | ---------------------------------- | -------------------------- |
| `background`              | `--background`                     | `bg-background`            |
| `foreground`              | `--foreground`                     | `text-foreground`          |
| `surface`                 | `--card`                           | `bg-card`                  |
| `surface-elevated`        | `--popover`                        | `bg-popover`               |
| `foreground-muted`        | `--muted-foreground`               | `text-muted-foreground`    |
| `border`                  | `--border`                         | `border-border`            |
| `accent-brand`            | `--primary` (recommended override) | `bg-primary`               |
| `accent-brand-foreground` | `--primary-foreground`             | `text-primary-foreground`  |
| `accent-brand-muted`      | `--accent`                         | `bg-accent`                |
| `destructive`             | `--destructive`                    | `bg-destructive`           |
| `focus-ring`              | `--ring`                           | `ring-ring`                |
| `radius-md`               | `--radius`                         | `rounded-lg`               |
| Sidebar (desktop nav)     | `--sidebar`, `--sidebar-accent`    | `bg-sidebar`               |

Fonts: `--font-sans` → Geist via `layout.js` in production.
