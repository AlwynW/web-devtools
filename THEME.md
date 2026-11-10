# Theming DevKit

Forks rebrand this app by editing `src/theme/`. Tool pages read those tokens through shared components, so a brand change should not be a hunt through every page.

Light and dark are two modes of one brand. The header toggle still stores `theme` in `localStorage` (`light` or `dark`).

## Edit these files

1. **[src/theme/brand.js](src/theme/brand.js)** — product name, short name, document title, and PWA description. `themeColor.light` / `themeColor.dark` are the browser chrome colors. Keep them aligned with `--shell` in `tokens.css` (defaults `#f5f5f4` / `#1c1917`).
2. **[src/theme/BrandMark.jsx](src/theme/BrandMark.jsx)** — icon beside the product name.
3. **[src/theme/fonts.css](src/theme/fonts.css)** — `@font-face` rules. Put files in `public/fonts/` and point `src` at them.
4. **[src/theme/tokens.css](src/theme/tokens.css)** — colors, fonts, radii, label size, header height.
5. **[index.html](index.html)** — fallback `<title>`, apple web app title, and the two `theme-color` metas (they run before JavaScript). Use the same hexes as `brand.js`.

`vite.config.js` reads `brand.js` for the PWA manifest. You do not edit the manifest name by hand.

## Tokens

Set light values on `:root`. Override the roles that flip on `html.dark`. Leave the `@theme inline` block alone unless you add a new role: it only exposes the variables to Tailwind.

| You change | Effect |
| --- | --- |
| `--font-sans`, `--font-mono` | UI text and mono chrome. Family names must match `@font-face`. |
| `--radius-control` | Inputs, search, segmented tracks, copy blocks |
| `--radius-button` | Buttons and segmented items |
| `--radius-panel` | Tool panels, nav tiles, toasts |
| `--radius-badge` | Small chrome such as the shortcut key |
| `--header-height` | Sticky header and the tool menu offset |
| `--label-size`, `--label-tracking` | Field labels (`.field-label`) |
| Color roles | See the table below |

Utilities are `bg-*`, `text-*`, and `border-*` of the role name: `bg-surface`, `text-fg-muted`, `border-border-strong`, `rounded-panel`.

| Token | Used for |
| --- | --- |
| `--shell` | Page background |
| `--surface` | Panels, header fields |
| `--surface-muted`, `--surface-code`, `--surface-inset` | Inset copy areas and code |
| `--surface-sunken` | Segmented tracks |
| `--chrome`, `--surface-glass` | Translucent header and search chip |
| `--fg`, `--fg-strong`, `--fg-soft`, `--fg-muted`, `--fg-subtle` | Text |
| `--border`, `--border-strong`, `--border-muted` | Panel, field, and quiet borders |
| `--primary`, `--primary-hover`, `--primary-fg`, `--primary-border` | Primary buttons |
| `--secondary*` | Secondary buttons |
| `--inverse`, `--inverse-fg`, `--inverse-border` | Toasts and inverted actions |
| `--selected`, `--selected-fg` | Active nav tile |
| `--focus`, `--emphasis` | Focus rings and selected outlines |
| `--hover`, `--hover-muted` | Hover fills |
| `--danger-*`, `--warning-*` | Error and warning banners |
| `--success`, `--favorite`, `--info` | Copy check, favourite star, hints |
| `--overlay`, `--scrollbar`, `--stage` | Menu scrim, scrollbar, dark tool stages |

Neutrals point at Tailwind's `stone` scale (`var(--color-stone-100)` and so on). To shift leftover stone utilities (camera frames, a few canvases, chart swatches), override `--color-stone-*` in the `@theme inline` block with your ramp. Prefer the semantic roles above for chrome.

## Components

Build new tools from these. Pass `className` for layout only (width, grid, spacing), not for colors.

| Component | Path |
| --- | --- |
| `PageHeader` | [src/components/ui/PageHeader.jsx](src/components/ui/PageHeader.jsx) |
| `Panel` | [src/components/ui/Panel.jsx](src/components/ui/Panel.jsx) |
| `Label` | [src/components/ui/Label.jsx](src/components/ui/Label.jsx) |
| `Input`, `Textarea` | [src/components/ui/Input.jsx](src/components/ui/Input.jsx) |
| `SegmentedControl` | [src/components/ui/SegmentedControl.jsx](src/components/ui/SegmentedControl.jsx) |
| `ErrorBanner`, `WarningBanner` | [src/components/ui/ErrorBanner.jsx](src/components/ui/ErrorBanner.jsx) |
| `Button` | [src/components/Button.jsx](src/components/Button.jsx) |

`Panel` accepts `as="section"` when the region should be a section. `Button` variants are `primary`, `secondary`, and `outline`.

## What not to do

- Do not restyle individual tool pages to change the brand.
- Do not add new `stone-*` or paired `dark:bg-*` color classes for chrome. Use a semantic utility or a component.
- Do not add a second theme object or a runtime brand picker. One brand, two modes.
- Canvas, crop, and preview graphics may keep local colors. If a border or label is part of the app chrome, use a token.

## Check

Change `--radius-panel` and `--radius-control` away from `0px` and confirm panels, buttons, and inputs follow. Change `--font-sans` and confirm the shell and page titles follow. Change `--primary` and `--shell` in both `:root` and `html.dark`.
