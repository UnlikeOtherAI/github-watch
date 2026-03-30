# GitHub Design Reference

Extracted from live GitHub pages (2026-03-30) using Playwright. All values are computed CSS from the light theme (default logged-out and logged-in app views).

Screenshots saved in `docs/screenshots/`:
- `github-home.png` -- Marketing homepage (logged out, dark theme)
- `github-actions.png` -- Actions workflow runs list (vercel/next.js)
- `github-repo.png` -- Repository main page (vercel/next.js)
- `github-login.png` -- Sign-in page

---

## 1. Color System

GitHub uses CSS custom properties (design tokens) for all colors. The app pages (repo, actions, issues) use a **light theme** by default. The marketing homepage uses a **dark theme**.

### 1.1 Light Theme (App Pages) -- Primary Palette

#### Foreground (Text) Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--fgColor-default` | `#1f2328` | Primary text, headings |
| `--fgColor-muted` | `#59636e` | Secondary text, timestamps, metadata |
| `--fgColor-accent` | `#0969da` | Links, interactive elements |
| `--fgColor-link` | `#0969da` | Explicit link color (same as accent) |
| `--fgColor-success` | `#1a7f37` | Success icons, completed status |
| `--fgColor-attention` | `#9a6700` | Warning text, pending/queued status |
| `--fgColor-severe` | `#bc4c00` | Severe warnings |
| `--fgColor-danger` | `#d1242f` | Error text, failed status |
| `--fgColor-open` | `#1a7f37` | Open issues/PRs (green) |
| `--fgColor-closed` | `#d1242f` | Closed issues/PRs (red) |
| `--fgColor-done` | `#8250df` | Merged/done (purple) |
| `--fgColor-sponsors` | `#bf3989` | Sponsors heart (pink) |
| `--fgColor-onEmphasis` | `#ffffff` | Text on emphasis backgrounds |

#### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bgColor-default` | `#ffffff` | Page background |
| `--bgColor-muted` | `#f6f8fa` | Subtle backgrounds, code blocks, box headers |
| `--bgColor-inset` | `#f6f8fa` | Inset/recessed areas |
| `--bgColor-emphasis` | `#25292e` | Dark emphasis (global header) |
| `--bgColor-accent-muted` | `#ddf4ff` | Blue tinted backgrounds (branch labels) |
| `--bgColor-accent-emphasis` | `#0969da` | Blue emphasis (active pagination) |
| `--bgColor-success-muted` | `#dafbe1` | Light green backgrounds |
| `--bgColor-success-emphasis` | `#1f883d` | Green emphasis (primary buttons) |
| `--bgColor-attention-muted` | `#fff8c5` | Light yellow backgrounds |
| `--bgColor-attention-emphasis` | `#9a6700` | Yellow/gold emphasis |
| `--bgColor-severe-muted` | `#fff1e5` | Light orange backgrounds |
| `--bgColor-severe-emphasis` | `#bc4c00` | Orange emphasis |
| `--bgColor-danger-muted` | `#ffebe9` | Light red backgrounds |
| `--bgColor-danger-emphasis` | `#cf222e` | Red emphasis |
| `--bgColor-open-muted` | `#dafbe1` | Open state muted |
| `--bgColor-open-emphasis` | `#1f883d` | Open state emphasis |
| `--bgColor-closed-muted` | `#ffebe9` | Closed state muted |
| `--bgColor-closed-emphasis` | `#cf222e` | Closed state emphasis |
| `--bgColor-done-muted` | `#fbefff` | Done/merged muted (light purple) |
| `--bgColor-done-emphasis` | `#8250df` | Done/merged emphasis |
| `--bgColor-neutral-muted` | `#818b981f` | Neutral muted (12% opacity gray) |
| `--bgColor-neutral-emphasis` | `#59636e` | Neutral emphasis (counters on hover) |
| `--bgColor-sponsors-muted` | `#ffeff7` | Sponsors muted (light pink) |
| `--bgColor-sponsors-emphasis` | `#bf3989` | Sponsors emphasis |

#### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--borderColor-default` | `#d1d9e0` | Standard borders (inputs, boxes) |
| `--borderColor-muted` | `#d1d9e0b3` | Subtle borders (70% opacity), row separators |
| `--borderColor-emphasis` | `#818b98` | Emphasized borders |
| `--borderColor-accent-muted` | `#54aeff66` | Blue accent border (40% opacity) |
| `--borderColor-accent-emphasis` | `#0969da` | Blue accent solid border |
| `--borderColor-success-muted` | `#4ac26b66` | Green border (40% opacity) |
| `--borderColor-success-emphasis` | `#1a7f37` | Green border solid |
| `--borderColor-attention-muted` | `#d4a72c66` | Yellow border (40% opacity) |
| `--borderColor-attention-emphasis` | `#9a6700` | Yellow border solid |
| `--borderColor-severe-muted` | `#fb8f4466` | Orange border (40% opacity) |
| `--borderColor-severe-emphasis` | `#bc4c00` | Orange border solid |
| `--borderColor-danger-muted` | `#ff818266` | Red border (40% opacity) |
| `--borderColor-danger-emphasis` | `#cf222e` | Red border solid |
| `--borderColor-done-muted` | `#c297ff66` | Purple border (40% opacity) |
| `--borderColor-done-emphasis` | `#8250df` | Purple border solid |
| `--borderColor-neutral-muted` | `#d1d9e0b3` | Neutral border |
| `--borderColor-neutral-emphasis` | `#59636e` | Neutral emphasis border |

### 1.2 Dark Theme (Marketing / Homepage)

| Token | Hex | Usage |
|-------|-----|-------|
| `--fgColor-default` | `#f0f6fc` | Primary text |
| `--fgColor-muted` | `#9198a1` | Secondary text |
| `--fgColor-accent` | `#4493f8` | Links |
| `--fgColor-success` | `#3fb950` | Success |
| `--fgColor-danger` | `#f85149` | Danger |
| `--bgColor-default` | `#0d1117` | Page background |
| `--bgColor-muted` | `#151b23` | Muted background |
| `--borderColor-default` | `#3d444d` | Standard borders |
| `--borderColor-muted` | `#3d444db3` | Subtle borders |

### 1.3 Workflow Status Colors (Actions-Specific)

These are the computed icon colors observed on the Actions page:

| Status | Icon Class | Color (rgb) | Hex |
|--------|-----------|-------------|-----|
| Success (completed) | `octicon-check-circle-fill color-fg-success` | `rgb(26, 127, 55)` | `#1a7f37` |
| Failure | `octicon-x-circle-fill color-fg-danger` | `rgb(209, 36, 47)` | `#d1242f` |
| Cancelled/Skipped | `octicon-stop neutral-check` / `octicon-skip neutral-check` | `rgb(89, 99, 110)` | `#59636e` |
| In Progress (pending) | `octicon-dot-fill` (animated) | `#9a6700` | `#9a6700` (attention) |
| Queued | `octicon-clock` | `rgb(89, 99, 110)` | `#59636e` |

---

## 2. Typography

### 2.1 Font Stacks

```css
/* System font (all UI text) */
--fontStack-system: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI",
  "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";

/* Monospace (code, branch names, file names) */
--fontStack-monospace: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", monospace;
```

### 2.2 Text Sizes

| Token | Size | Px Equivalent |
|-------|------|---------------|
| `--text-body-size-small` | `0.75rem` | 12px |
| `--text-body-size-medium` | `0.875rem` | 14px |
| `--text-body-size-large` | `1rem` | 16px |
| `--text-title-size-small` | `1rem` | 16px |
| `--text-title-size-medium` | `1.25rem` | 20px |
| `--text-title-size-large` | `2rem` | 32px |
| `--text-subtitle-size` | `1.25rem` | 20px |

### 2.3 Line Heights

| Token | Value |
|-------|-------|
| `--text-body-lineHeight-small` | `1.625` |
| `--text-body-lineHeight-medium` | `1.5` |
| `--text-body-lineHeight-large` | `1.5` |
| `--text-title-lineHeight-small` | `1.5` |
| `--text-title-lineHeight-medium` | `1.625` |
| `--text-title-lineHeight-large` | `1.5` |

### 2.4 Font Weights

| Weight | Usage |
|--------|-------|
| `400` | Body text, secondary text, nav items (inactive) |
| `500` | Buttons, counter badges, topic tags, links |
| `600` | Headings, labels, active nav tab, section headings |

### 2.5 Common Text Styles

| Element | Font Size | Weight | Color | Line Height |
|---------|-----------|--------|-------|-------------|
| Body text | 14px | 400 | `#1f2328` | 21px (1.5) |
| Muted/secondary text | 12px | 400 | `#59636e` | 18px (1.5) |
| Page heading (h1) | 20px | 600 | `#1f2328` | -- |
| Section heading (h2) | 20px | 600 | `#1f2328` | -- |
| Small heading | 12px | 600 | `#59636e` | 19.5px |
| Link text | 14px | 500 | `#0969da` | -- |
| Nav item | 14px | 400 | `#1f2328` | -- |
| Active nav item | 14px | 600 | `#1f2328` | -- |
| Code/monospace | 12px | 400 | `#0969da` | -- (on blue bg) |

---

## 3. Spacing System

GitHub uses a base-4 spacing scale via CSS custom properties.

### 3.1 Spacing Tokens

| Token | Value | Px |
|-------|-------|----|
| `--base-size-4` | `0.25rem` | 4px |
| `--base-size-8` | `0.5rem` | 8px |
| `--base-size-12` | `0.75rem` | 12px |
| `--base-size-16` | `1rem` | 16px |
| `--base-size-20` | `1.25rem` | 20px |
| `--base-size-24` | `1.5rem` | 24px |
| `--base-size-28` | `1.75rem` | 28px |
| `--base-size-32` | `2rem` | 32px |
| `--base-size-40` | `2.5rem` | 40px |
| `--base-size-48` | `3rem` | 48px |

### 3.2 Common Spacing Patterns

| Context | Padding/Margin | Value |
|---------|---------------|-------|
| Box row (list item) | padding | `16px` all sides |
| Box header (filter bar) | padding | `16px` all sides |
| Nav link | padding | `0 8px` |
| Global header | padding | `16px 0` |
| Repo header area | padding-top | `16px` |
| Small button | padding | `3px 12px` |
| Default button | padding | `5px 16px` |
| Input field | padding | `5px 12px` |
| Badge/counter | padding | `0 6px` |
| Branch label | padding | `2px 6px` |
| Topic tag | padding | `0 10px` |
| Tab (pill) | padding | `8px 16px` |
| Footer | padding-top | `40px` |
| Search input (filter) | padding | `5px 32px` (extra for icon) |

---

## 4. Border Radius

### 4.1 Radius Tokens

| Token | Value | Px |
|-------|-------|----|
| `--borderRadius-small` | `0.1875rem` | 3px |
| `--borderRadius-medium` | `0.375rem` | 6px |
| `--borderRadius-large` | `0.75rem` | 12px |
| `--borderRadius-full` | `624.938rem` | Fully round (pill) |

### 4.2 Usage by Component

| Component | Radius | Token |
|-----------|--------|-------|
| Buttons | `6px` | `--borderRadius-medium` |
| Input fields | `6px` | `--borderRadius-medium` |
| Branch labels | `6px` | `--borderRadius-medium` |
| Box container (list header) | `6px` top corners | `--borderRadius-medium` |
| Counter badges | `24px` | `--borderRadius-full` |
| Topic tags | `24px` | `--borderRadius-full` |
| Pill tabs (marketing) | `60px` | Near-full |
| Avatars (circular) | `50%` or `--borderRadius-full` | Fully round |
| Cards | `6px` or `12px` | `--borderRadius-medium` / `--borderRadius-large` |

---

## 5. Shadows

```css
/* Subtle resting shadow for cards */
--shadow-resting-small: 0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808;

/* Medium resting shadow */
--shadow-resting-medium: 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f;

/* Floating overlay (small) -- dropdowns, popovers */
--shadow-floating-small: 0 0 0 1px #d1d9e080, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f;

/* Floating overlay (medium) -- modals, large dropdowns */
--shadow-floating-medium: 0 0 0 1px #d1d9e000, 0 8px 16px -4px #25292e14,
  0 4px 32px -4px #25292e14, 0 24px 48px -12px #25292e14, 0 48px 96px -24px #25292e14;
```

---

## 6. Component Reference

### 6.1 Global Header (App Bar)

```
Background: #25292e (--header-bgColor)
Height: 72px
Padding: 16px 0
Text color: #ffffff
Search border: #818b98 (--headerSearch-borderColor)
Search background: #25292e (--headerSearch-bgColor)
Divider: #818b98 (--header-borderColor-divider)
```

The global header contains: logo (left), nav links (center-left), search bar (center-right), sign-in/sign-up (right). When logged in: logo, search, nav icons, avatar.

### 6.2 Repository Header

```
Background: #f6f8fa (--bgColor-muted)
Padding-top: 16px
Contains: owner/repo name, visibility badge, action buttons (Watch, Fork, Star)
```

### 6.3 Underline Navigation (Repo Tabs)

```
Tab text: 14px, weight 400, color #1f2328
Active tab: weight 600, bottom border 2px solid #fd8c73 (--underlineNav-borderColor-active)
Hover border: #d1d9e0b3 (--underlineNav-borderColor-hover)
Icon color: #59636e (--underlineNav-iconColor-rest)
Tab padding: 0 8px
Counter badges inline with tab text
```

Tabs: Code, Issues, Pull requests, Discussions, Actions, Security, Insights

### 6.4 Buttons

#### Default Button (e.g., Fork, Star, Notifications)
```css
background: #f6f8fa;  /* --button-default-bgColor-rest */
background-hover: #eff2f5;  /* --button-default-bgColor-hover */
background-active: #e6eaef;  /* --button-default-bgColor-active */
color: #25292e;  /* --button-default-fgColor-rest */
border: 1px solid #d1d9e0;  /* --button-default-borderColor-rest */
border-radius: 6px;
padding: 3px 12px;  /* small size */
font-size: 12px;
font-weight: 500;
height: 28px;  /* small */
```

#### Primary Button (e.g., Sign in, Create, Merge)
```css
background: #1f883d;  /* --button-primary-bgColor-rest */
background-hover: #1c8139;  /* --button-primary-bgColor-hover */
background-active: #197935;  /* --button-primary-bgColor-active */
background-disabled: #95d8a6;  /* --button-primary-bgColor-disabled */
color: #ffffff;  /* --button-primary-fgColor-rest */
border: 1px solid rgba(31, 35, 40, 0.15);  /* --button-primary-borderColor-rest */
border-radius: 6px;
padding: 5px 16px;  /* medium size */
font-size: 14px;
font-weight: 500;
height: 32px (medium) or 40px (large, e.g. sign-in page);
```

#### Danger Button
```css
background: #f6f8fa;  /* --button-danger-bgColor-rest (same as default at rest) */
background-hover: #cf222e;  /* --button-danger-bgColor-hover */
color: #d1242f;  /* --button-danger-fgColor-rest */
/* On hover, text becomes white */
```

#### Outline Button
```css
background: #f6f8fa;  /* --button-outline-bgColor-rest */
background-hover: #0969da;  /* --button-outline-bgColor-hover */
color: #0969da;  /* --button-outline-fgColor-rest */
/* On hover, text becomes white */
```

#### Invisible/Ghost Button
```css
background: transparent;
background-hover: #818b981a;  /* --button-invisible-bgColor-hover */
color: #25292e;  /* --button-invisible-fgColor-rest */
border: none;
```

### 6.5 Form Controls (Inputs)

```css
background: #ffffff;
color: #1f2328;
border: 1px solid #d1d9e0;  /* --control-borderColor-rest */
border-focus: 1px solid #0969da;  /* observed on login page active input */
border-radius: 6px;
padding: 5px 12px;
font-size: 14px (app) or 16px (login page);
height: 32px (app) or 40px (login page);
placeholder-color: #59636e;  /* --control-fgColor-placeholder */
```

### 6.6 Counter Badges

```css
background: rgba(129, 139, 152, 0.12);  /* --bgColor-neutral-muted */
color: #25292e;
border-radius: 24px;  /* pill shape */
padding: 0 6px;
font-size: 12px;
font-weight: 500;
min-width: 20px;
line-height: 18px;
display: inline-block;
text-align: center;
border: 1px solid transparent;
```

### 6.7 Branch / Code Labels

```css
background: #ddf4ff;  /* --bgColor-accent-muted */
color: #0969da;  /* --fgColor-accent */
border-radius: 6px;
padding: 2px 6px;
font-size: 12px;
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
```

### 6.8 Topic Tags

```css
background: #ddf4ff;  /* --bgColor-accent-muted */
color: #0969da;  /* --fgColor-accent */
border-radius: 24px;  /* pill shape */
padding: 0 10px;
font-size: 12px;
font-weight: 500;
border: 1px solid transparent;
```

### 6.9 Avatars

```css
background: #ffffff;  /* --avatar-bgColor */
border: 1px solid rgba(31, 35, 40, 0.15);  /* --avatar-borderColor: #1f232826 */
border-radius: 50%;  /* circular */
shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);  /* --avatar-shadow */
/* Common sizes: 20px, 28px, 32px, 40px, 48px */
```

### 6.10 Box Container (List Container)

The `Box` component wraps lists (workflow runs, file trees, etc.):

```css
border: 1px solid #d1d9e0;  /* --borderColor-default */
border-radius: 6px;
background: #ffffff;

/* Box header (filter bar) */
.Box-header {
  background: #f6f8fa;  /* --bgColor-muted */
  padding: 16px;
  border-bottom: 1px solid #d1d9e0;
  border-radius: 6px 6px 0 0;  /* top corners only */
}

/* Box row (list item) */
.Box-row {
  padding: 16px;
  border-top: 1px solid rgba(209, 217, 224, 0.7);  /* --borderColor-muted */
  /* First row has transparent border-top */
}

/* Box row hover */
.Box-row:hover {
  background: #f6f8fa;
}
```

### 6.11 Overlay / Dropdown Menu

```css
background: #ffffff;  /* --overlay-bgColor */
border: 1px solid rgba(209, 217, 224, 0.5);  /* --overlay-borderColor: #d1d9e080 */
border-radius: 12px;  /* --borderRadius-large */
box-shadow: var(--shadow-floating-small);
```

### 6.12 Pagination

```css
/* Active page button */
background: #0969da;  /* --bgColor-accent-emphasis */
color: #ffffff;
border-radius: 6px;
font-weight: 400;

/* Inactive page button */
background: transparent;
color: #1f2328;
```

---

## 7. Actions Page -- Specific Patterns

### 7.1 Page Layout

```
+----------------------------------------------+
|  Global Header (dark, 72px)                   |
+----------------------------------------------+
|  Repo Header (#f6f8fa)                        |
|  owner / repo-name  [Watch] [Fork] [Star]     |
+----------------------------------------------+
|  Underline Nav (Code | Issues | ... | Actions) |
+----------------------------------------------+
| Sidebar (220px)  |  Main Content Area          |
| - All workflows  |  +-- Filter bar (Box-header)|
| - workflow-1     |  |  Event | Status | Branch ||
| - workflow-2     |  +-------------------------+|
| - workflow-3     |  |  Workflow run row        ||
|   ...            |  |  Workflow run row        ||
|                  |  |  ...                     ||
|                  |  +-- Pagination             ||
+----------------------------------------------+
```

### 7.2 Sidebar (Workflow List)

```
Width: ~220px (left panel)
"Actions" heading: 16px, weight 600, color #1f2328
"All workflows" active item: background #f6f8fa, font-weight 600
Workflow names: 14px, weight 400, color #1f2328
Section heading "Management": 12px, weight 600, color #59636e, uppercase not used
Items: Caches, Deployments with icons
```

### 7.3 Filter Bar (Box-header)

```
Background: #f6f8fa
Padding: 16px
Border-bottom: 1px solid #d1d9e0
Contains: "N workflow runs" count + dropdown filters (Event, Status, Branch, Actor)
Filter text: 14px, color #59636e
Search input:
  height: 32px
  border: 1px solid #d1d9e0
  border-radius: 6px
  padding: 5px 32px (left padding for search icon)
  placeholder: "Filter workflow runs"
  font-size: 14px
```

### 7.4 Workflow Run Row

Each row contains a status icon, title, metadata, branch label, timestamp, and duration.

```
Layout: Block display with internal flex rows
Padding: 16px
Border-top: 1px solid rgba(209, 217, 224, 0.7)  (first row has transparent)
Hover: background #f6f8fa

Row structure (left to right):
  [Status Icon 16x16]  [Title + Subtitle]  ...spacer...  [Branch Label]  [Timestamp + Duration]  [...]

Status Icon:
  - SVG, 16x16px
  - Success: green filled circle-check (#1a7f37)
  - Failure: red filled x-circle (#d1242f)
  - Cancelled: gray stop/skip (#59636e)
  - In progress: animated yellow dot (#9a6700)
  - Queued: gray clock (#59636e)

Title:
  - Font size: 16px (visually prominent in the row)
  - Font weight: 600
  - Color: #1f2328
  - On hover: underline, color #0969da

Subtitle (second line):
  - Font size: 12px
  - Font weight: 400
  - Color: #59636e
  - Contains: workflow name, run number, trigger info, event source

Branch Label (right-aligned):
  - Monospace font
  - Background: #ddf4ff
  - Color: #0969da
  - Border-radius: 6px
  - Padding: 2px 6px
  - Font size: 12px
  - Truncated with max-width + ellipsis

Timestamp:
  - Font size: 12px
  - Color: #59636e
  - Icon: calendar (octicon)

Duration:
  - Font size: 12px
  - Color: #59636e
  - Icon: stopwatch (octicon)

Three-dot menu (far right):
  - Width: 24px
  - Color: #59636e
  - Appears on hover or always visible
```

### 7.5 Workflow Run Status Icons (Octicons)

GitHub uses the Octicons icon set. Status icons on the Actions page:

| Status | Octicon Name | Fill Style | Color |
|--------|-------------|------------|-------|
| Completed (success) | `check-circle-fill` | Filled | `#1a7f37` |
| Failed | `x-circle-fill` | Filled | `#d1242f` |
| Cancelled | `stop` | Outline | `#59636e` |
| Skipped | `skip` | Outline | `#59636e` |
| In progress | `dot-fill` (animated spin) | Filled | `#9a6700` |
| Queued/Waiting | `clock` | Outline | `#59636e` |
| Action required | `alert` | Outline | `#9a6700` |

All status icons are 16x16px SVGs using `currentColor` for fill.

---

## 8. Language Bar Colors

Observed on the Next.js repo page:

| Language | Color |
|----------|-------|
| TypeScript | `rgb(49, 120, 198)` / `#3178c6` |
| JavaScript | `rgb(241, 224, 90)` / `#f1e05a` |
| Rust | `rgb(222, 165, 132)` / `#dea584` |
| CSS | `rgb(102, 51, 153)` / `#663399` |
| Shell | `rgb(137, 224, 81)` / `#89e051` |

The language bar is a single-height (8px) rounded progress bar showing relative proportions.

---

## 9. Layout Patterns

### 9.1 Page Container

```
Max width: 1280px (container-xl)
Padding: 0 16px (small screens), 0 24px (medium), 0 32px (large)
Centered with margin: 0 auto
```

### 9.2 Repo Page Layout

```
Two-column layout:
  Main content: ~75% width
  Sidebar (About): ~25% width
  Gap: 16-24px
```

### 9.3 Actions Page Layout

```
Two-column layout:
  Left sidebar: ~220px fixed
  Main content: flex-grow
  Gap: 32px (sidebar padding: 5px 32px observed)
```

---

## 10. Quick Reference -- Key Values for Replication

### Essential Colors
```css
:root {
  /* Backgrounds */
  --gh-bg: #ffffff;
  --gh-bg-subtle: #f6f8fa;
  --gh-bg-emphasis: #25292e;

  /* Text */
  --gh-text: #1f2328;
  --gh-text-secondary: #59636e;
  --gh-text-link: #0969da;

  /* Status */
  --gh-success: #1a7f37;
  --gh-success-bg: #dafbe1;
  --gh-danger: #d1242f;
  --gh-danger-bg: #ffebe9;
  --gh-warning: #9a6700;
  --gh-warning-bg: #fff8c5;
  --gh-neutral: #59636e;
  --gh-done: #8250df;
  --gh-done-bg: #fbefff;

  /* Borders */
  --gh-border: #d1d9e0;
  --gh-border-muted: rgba(209, 217, 224, 0.7);

  /* Accent */
  --gh-accent: #0969da;
  --gh-accent-bg: #ddf4ff;

  /* Buttons */
  --gh-btn-bg: #f6f8fa;
  --gh-btn-border: #d1d9e0;
  --gh-btn-primary-bg: #1f883d;

  /* Header */
  --gh-header-bg: #25292e;
}
```

### Essential Sizing
```css
:root {
  --gh-radius-sm: 3px;
  --gh-radius-md: 6px;
  --gh-radius-lg: 12px;
  --gh-radius-full: 9999px;

  --gh-font-system: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Noto Sans", Helvetica, Arial, sans-serif;
  --gh-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
    "Liberation Mono", monospace;

  --gh-text-xs: 12px;
  --gh-text-sm: 14px;
  --gh-text-base: 16px;
  --gh-text-lg: 20px;
  --gh-text-xl: 24px;
  --gh-text-2xl: 32px;

  --gh-header-height: 72px;
}
```
