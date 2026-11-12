# Theming

Forks rebrand this app by editing `src/theme/`. Tool pages read those tokens through shared components, so a brand change should not be a hunt through every page.

Light and dark are two modes of one brand. The header toggle stores `theme` in `localStorage` (`light` or `dark`).

## Rules

1. Change the brand in `src/theme/` and `public/` icons. Do not restyle tool pages to change the brand.
2. Never switch the radius or color role an element uses to get a different look. If no role fits, add a role (see [Adding a role](#adding-a-role)).
3. Pair every fill role with its own text role. Never mix pairs (see [Color pairs](#color-pairs)).
4. Use `Button` for actions and `SegmentedControl` for single-choice toggles. Do not hand-roll button colors.
5. Run the [Check](#check) and update this file in the same change (see [Definition of done](#definition-of-done)).

## Edit these files

1. **[src/theme/brand.js](src/theme/brand.js)**: the single source for names and browser chrome colors.
   - `name`: shown next to the logo in the header, and used in generated output (the `.gitignore` header).
   - `shortName`: home screen and PWA name.
   - `title`: browser tab title.
   - `description`: PWA description.
   - `themeColor.light` / `themeColor.dark`: browser chrome colors. Keep them equal to `--shell` in each mode.
2. **[src/theme/BrandMark.jsx](src/theme/BrandMark.jsx)**: the logo left of the name. Draw it as inline SVG with `fill="currentColor"` so it follows the text color in both modes. Do not use a PNG or a fixed fill, or it disappears in one mode. Keep `aria-label` set to the brand name.
3. **[src/theme/tokens.css](src/theme/tokens.css)**: raw brand palette, color roles, fonts, radii, label size, header height.
4. **[src/theme/fonts.css](src/theme/fonts.css)**: `@font-face` rules. See [Fonts](#fonts).
5. **`public/`**: favicons and PWA icons (`favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`). These are files, not tokens, so replace all of them when the logo changes:
   - `favicon.svg`: the logo with a `prefers-color-scheme: dark` style inside the SVG, so it shows on light and dark tab strips.
   - `favicon.ico` (16, 32, 48) and `favicon-16x16.png` / `favicon-32x32.png`: PNGs cannot switch with the color scheme, so put the logo on a solid shape (a disc or square in the light shell color).
   - `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`: the logo on a full opaque square, scaled to about 72% (Apple) or 66% (PWA) so it stays inside the maskable safe zone. Never use a transparent background here; iOS fills it with black.

`index.html` holds the title, app name and the two `theme-color` metas as real values, so the source reads correctly. On dev and build, `vite.config.js` overwrites those four values from `brand.js` and builds the PWA manifest from it. `brand.js` wins if they differ, but update `index.html` in the same change so the source matches. The inline theme script in `index.html` reads its color from the `theme-color` metas, so it has no hexes of its own. Do not edit the manifest by hand.

### Rename the app

Change `name` and `shortName` (and `title` if needed) in `brand.js`, and the matching `<title>` and `apple-mobile-web-app-title` in `index.html`. Then search for the old name (`rg -n "OldName" src index.html`) and expect only sample content, such as the TOML converter's example input.

## Raw palette

Put brand colors (for example `--brand`, `--brand-strong`, `--ink`, `--canvas`) at the top of `:root` in `tokens.css`. Roles reference them: `--primary: var(--brand)`.

Raw palette variables are not Tailwind utilities. Pages and components never use them; they use roles.

Neutrals use Tailwind's `stone-*` names. To give leftover `stone-*` utilities the brand's greys, override `--color-stone-50` to `--color-stone-950` at the top of the `@theme inline` block.

## Fonts

- Use woff2 files in `public/fonts/`. Convert OTF/TTF first (for example `fontTools` with `brotli`).
- Write one `@font-face` per weight file. The family name must match `--font-sans` / `--font-mono` exactly.
- The app uses weights 400 to 900 (`font-normal` to `font-black`). If the family stops below 900, give its heaviest file a range (`font-weight: 700 900`) so the browser does not synthesize bold.
- Only commit fonts licensed for web use. Keep the license file next to the font (for example `public/fonts/geist-mono-OFL.txt`).

## Radius roles

Every element with a full border or its own fill on top of another surface gets exactly one of these. An unrounded bordered element is a bug, unless it is a table cell or rounding would clip something interactive (crop or resize handles that sit on the edge). Preview stages and image frames get `rounded-control overflow-hidden`. Partial borders (`border-b`, `border-l`) are dividers and need no radius.

| Utility | Token | Use for | Value limits |
| --- | --- | --- | --- |
| `rounded-button` | `--radius-button` | Buttons, icon buttons, segmented tracks and their items, header chips (search chip, theme toggle) | Any value, including `9999px` pills |
| `rounded-control` | `--radius-control` | Text inputs, selects, textareas, copy and code blocks, bordered tiles and rows inside a panel (selectable cards, result rows, previews) | Keep at 16px or less. Textareas and code blocks break as pills |
| `rounded-panel` | `--radius-panel` | `Panel`, nav tiles, toasts, dialogs, top-level cards | Any value |
| `rounded-badge` | `--radius-badge` | Non-clickable chips: tags, the shortcut key, counters | Any value |

If an element fits none of these, add a role. Do not borrow the closest one.

## Color roles

Utilities are `bg-*`, `text-*` and `border-*` of the role name: `bg-surface`, `text-fg-muted`, `border-border-strong`.

| Token | Used for |
| --- | --- |
| `--shell` | Page background |
| `--surface` | Panels, header fields |
| `--surface-muted`, `--surface-code`, `--surface-inset` | Inset copy areas and code |
| `--surface-sunken` | Segmented tracks |
| `--chrome`, `--surface-glass` | Translucent header and search chip |
| `--fg`, `--fg-strong`, `--fg-soft`, `--fg-muted`, `--fg-subtle` | Text |
| `--border`, `--border-strong`, `--border-muted` | Panel, field and quiet borders |
| `--primary`, `--primary-hover`, `--primary-fg`, `--primary-border` | Primary buttons, selected segment |
| `--secondary*` | Secondary buttons |
| `--inverse`, `--inverse-fg`, `--inverse-border` | Toasts and inverted surfaces |
| `--selected`, `--selected-fg` | Active nav tile |
| `--focus`, `--emphasis` | Focus rings and selected outlines |
| `--hover`, `--hover-muted` | Hover fills |
| `--danger-*`, `--warning-*` | Error and warning banners |
| `--success`, `--favorite`, `--info` | Copy check, favourite star, hints |
| `--overlay`, `--scrollbar`, `--stage` | Menu scrim, scrollbar, dark tool stages |

### Color pairs

Each fill has one text role. Use them together and nothing else on that fill:

| Fill | Text | Border |
| --- | --- | --- |
| `bg-primary` | `text-primary-fg` | `border-primary-border` |
| `bg-secondary` | `text-secondary-fg` | `border-secondary-border` |
| `bg-inverse` | `text-inverse-fg` | `border-inverse-border` |
| `bg-selected` | `text-selected-fg` | |
| `bg-danger-bg` | `text-danger-fg` | `border-danger-border` |
| `bg-warning-bg` | `text-warning-fg` | `border-warning-border` |

- When you make a fill light (a pastel primary, for example), make its text role dark, and the reverse.
- Never use a fill role as a text color (`text-primary`, `text-selected`). A light brand color fails contrast on `--surface`.
- Mixing pairs is invisible until the brand changes. `bg-inverse text-primary-fg` looks fine while the primary is dark, and becomes dark text on a dark fill once the primary is a light color.

### Tokens read outside CSS

- `src/utils/markdownWithMermaid.js` reads tokens with `getComputedStyle` because Mermaid needs resolved colors: `--surface`, `--surface-sunken`, `--shell`, `--fg`, `--fg-soft`, `--fg-muted`, `--border-muted`, `--primary`, `--primary-fg`, `--primary-border`, `--font-sans`. Set these to plain colors or `var()` of plain colors, never `color-mix()`.
- `src/components/SchemaCanvas.jsx` uses `var(--fg-muted)`, `var(--shell)` and `var(--font-mono)`.
- Tool content keeps local colors on purpose: default canvas colors in `CssGridComposer` and `ImageCrop`, exported images in `utils/assetGridComposer.js`, the font specimen in `utils/fontMeta.js`. They are user content, not brand chrome.

## Other tokens

| Token | Effect |
| --- | --- |
| `--font-sans`, `--font-mono` | UI text and mono chrome |
| `--header-height` | Sticky header and the tool menu offset |
| `--label-size`, `--label-tracking` | Field labels (`field-label` utility) |
| `--button-font`, `--button-weight`, `--button-tracking`, `--button-size`, `--button-size-sm` | Button and segmented control text (`button-text`, `button-text-sm` utilities) |
| `--title-weight` | Page titles and the product name in the header (`title-text` utility) |
| `--brand-name-case` | `text-transform` of the product name in the header (`uppercase` or `none`) |

Typography that differs per brand lives in these tokens, not in component classes. If a brand needs another typographic difference, add a token and a utility next to these.
## Components

Build tools from these. Pass `className` for layout only (width, grid, spacing, margin), never for color, radius, padding or font.

| Component | Path | Notes |
| --- | --- | --- |
| `Button` | [src/components/Button.jsx](src/components/Button.jsx) | `variant`: `primary`, `secondary`, `outline`. `size`: `md`, `sm`. `icon`: a phosphor icon. Other props (`disabled`, `title`, `aria-label`, `onClick`) pass through |
| `SegmentedControl` | [src/components/ui/SegmentedControl.jsx](src/components/ui/SegmentedControl.jsx) | `options` (strings or `{ value, label }`), `value`, `onChange` |
| `Panel` | [src/components/ui/Panel.jsx](src/components/ui/Panel.jsx) | `as="section"` for a section |
| `Label` | [src/components/ui/Label.jsx](src/components/ui/Label.jsx) | Or the `field-label` class. Never hand-write `text-[11px] uppercase tracking-[...]` |
| `Input`, `Textarea` | [src/components/ui/Input.jsx](src/components/ui/Input.jsx) | |
| `ErrorBanner`, `WarningBanner` | [src/components/ui/ErrorBanner.jsx](src/components/ui/ErrorBanner.jsx) | |
| `PageHeader` | [src/components/ui/PageHeader.jsx](src/components/ui/PageHeader.jsx) | |
| `CopyPre`, `CopyArea`, `CopyButton` | [src/components/](src/components/) | `CopyPre`'s `className` replaces its default classes, so a custom one must include `border rounded-control` and a surface |

Plain `<button>` is fine for text links (no border, no fill). If a toggle group needs custom content and cannot use `SegmentedControl`, copy its classes: track `rounded-button bg-surface-sunken border border-border-strong p-1`, items `rounded-button`, selected item `bg-primary text-primary-fg`.

## Adding a role

1. Add the variable to `:root` and, if it changes in dark mode, to `html.dark`.
2. Expose it in `@theme inline` (`--color-<name>: var(--<name>)` or `--radius-<name>: var(--radius-<name>)`).
3. Add a row to the matching table in this file.

## What not to do

- Do not restyle individual tool pages to change the brand.
- Do not add `stone-*` or paired `dark:bg-*` color classes for chrome. Use a role or a component.
- Do not add a second theme object or a runtime brand picker. One brand, two modes.
- Do not reference raw palette variables (`--brand`, `--ink`) outside `tokens.css`.

## Check

Run these from the repo root. Each search must return nothing except the known exceptions below.

```sh
npm run build

# Mixed color pairs and fill roles used as text
rg -n "bg-inverse[^\"\`]*text-primary-fg|bg-primary[^\"\`]*text-inverse-fg|text-(primary|selected|inverse)[\"\` ]" src

# Bordered elements without a radius (static class strings)
rg -n -P 'className="(?![^"]*rounded)[^"]*(?<![\w-])border(?![\w-])[^"]*"' src/pages src/components

# Hand-written field labels
rg -n "uppercase tracking-\[0\.18em\]|tracking-\[0\.18em\] uppercase" src

# Old brand values (replace with the previous brand's font names and hexes)
rg -n "Space Grotesk|JetBrains Mono" src
```

Known exception: the two favicon source previews in `FaviconGenerator.jsx` stay square because they show the user's icon at its exact shape. Add any new exception here with its reason.

Then confirm in `dist/assets/index-*.css` that `--primary`, `--shell` and the font family have the new values, and that `dist/index.html` shows the title, app name and theme colors from `brand.js`. Check both modes in the browser: header logo and name, tool menu, a form page (Base64 Encoder), a page with buttons and a segmented control (SVG Tools), a toast (copy any output), and a Markdown page with a Mermaid diagram.

## Definition of done

- The Check passes.
- If you changed a default value, a token's meaning, which role a component uses, or a component's props, the tables in this file say so.
