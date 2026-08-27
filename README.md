## DevKit – Modern Developer Utilities

DevKit is a sleek, browser-based toolbox for everyday developer tasks. It bundles a collection of generators, converters, validators, and reference tools into a single, fast interface so you don't have to keep ten tabs and five CLI commands open just to get simple things done.

[Demo](https://dev.alwyn.be)

### Features

- **Generators**
  - **Password**: Generate strong, random passwords.
  - **UUID Gen**: Create RFC-compliant UUIDs, including bulk generation.
  - **Persona**: Quickly spin up fake personas for testing.
  - **Lorem**: Generate lorem ipsum placeholder text.
  - **Slug**: Convert text to URL-friendly slugs.
  - **QR Code**: Generate QR codes from text/URLs.
  - **Icon**: Generate icons from text, emoji or image.

- **CSS & Design**
  - **Drop Shadow**: Design single and layered box shadows.
  - **Gradient Builder**: Build layered gradients with stop opacity controls.
  - **Grid**: Experiment with CSS grid layouts.
  - **Asset Grid**: Compose multiple images on one canvas and export PNG or JPG.
  - **Perfect Border**: Tweak border radius until it looks just right.
  - **Color**: Explore and convert colors for your UI.
  - **Contrast**: Check WCAG text contrast between two colors.
  - **Clamp**: Generate fluid clamp() values from viewport bounds.
  - **Easing**: Edit cubic-bezier curves and copy timing CSS.
  - **Shades**: OKLCH ramp from darker to lighter; copy hex table or CSS variables.
  - **SVG**: Optimize SVG, edit path d with preview, build sprites.
  - **Font Converter**: Convert TTF/OTF/WOFF/WOFF2, group families, set weights, and copy @font-face CSS.

- **Signals & spelling**
  - **Braille**: Grade 1 English Braille with Unicode patterns; number sign for digits.
  - **Morse Code**: Encode/decode Morse with reference table.
  - **NATO Phonetic**: Spell text with ICAO words and digit names.

- **Encode / Decode**
  - **Base64**: Encode/decode text using Base64.
  - **Base64 Image**: Encode/decode images using Base64.
  - **URL**: URL-encode and decode strings.
  - **HTML Entity**: Convert text to/from HTML entities.
  - **Escape/Unescape**: Escape strings for JSON, regex, SQL, etc.
  - **Hex Converter**: Convert between hex, binary, decimal, octal.
  - **Unicode**: Inspect graphemes, code points, UTF-8, and normalization.

- **Hashing & Security**
  - **Hash**: Create hashes for strings.
  - **HMAC**: HMAC-SHA256 or HMAC-SHA512; hex and Base64 output in the browser.
  - **Password Hash**: Hash passwords with bcrypt.
  - **JWT**: Decode, verify HS256, and create HS256/RS256 signed JWTs.
  - **chmod**: Toggle Unix rwx permissions and copy octal chmod.

- **Format & Convert**
  - **JSON**: Pretty-print, minify, and validate JSON.
  - **JSON Editor**: Edit JSON in a tree: keys, values, reorder, collapse, duplicate, delete.
  - **XML**: Format, minify, and check well-formed XML in the browser.
  - **Markdown/HTML**: Convert between Markdown and HTML.
  - **YAML/JSON**: Convert between YAML and JSON.
  - **TOML/JSON**: Convert between TOML and JSON in the browser.
  - **CSV/JSON**: Convert between CSV and JSON.
  - **Table/CSV**: Convert HTML tables to CSV and CSV to HTML tables.
  - **SQL Formatter**: Format and minify SQL queries.
  - **SQL Schema**: Drop or paste DDL to explore tables, columns, and relationships.
  - **GraphQL**: Parse and print GraphQL documents. Validates syntax; no server.
  - **cURL → JS**: Turn common curl commands into fetch or axios snippets.

- **Web & Config**
  - **Meta Tags**: Generate Open Graph and Twitter meta tags.
  - **Crontab**: Build cron expressions, humanize them, and preview next run times.
  - **.env**: Parse and edit .env files locally, then copy export.
  - **Nginx**: Format nginx configs and run light lint checks.
  - **Redirects**: Generate redirect snippets for Netlify, Vercel, and more.
  - **CSP**: Build a Content-Security-Policy header or meta tag. Empty fields are omitted.
  - **.gitignore**: Combine preset blocks and your own lines; duplicates removed.
  - **Robots**: Build User-agent groups and Sitemap lines; copy the file body.

- **Inspect & Analyze**
  - **Regex**: Build and test regular expressions.
  - **URL Parser**: Parse and build URLs with query params.
  - **URL Redirects**: Inspect redirect chains from curl output or in-browser fetch.
  - **Diff**: Line-based unified or side-by-side diff with optional ignore trim and case.
  - **Semver**: Compare versions and test npm-style semver ranges.
  - **Keycode**: Focus a capture area; see key, code, which, and modifiers (keydown).
  - **MarkDown Viewer**: Render Markdown for quick previews.

- **Time**
  - **Timestamp**: Convert to/from Unix timestamps.
  - **Timezones**: Compare the same instant across two IANA time zones.
  - **Stopwatch**: Lap-capable stopwatch with a wide high-resolution display.
  - **Countdown**: Count down with a full-screen flash when time hits zero.

- **Reference**
  - **HTTP Status**: Look up HTTP status codes.
  - **Tailwind**: Quick Tailwind CSS reference.
  - **My IP**: Show your public IP address.
  - **Git Cheatsheet**: Quick reference for common Git commands.
  - **Windows Cheat Sheet**: Explorer paths, environment variables, shell: folders, and Run dialog commands.
  - **ASCII Table**: Look up character codes and symbols.
  - **MIME**: Look up MIME types by file extension.
  - **Local Notes**: Store notes in localStorage. Add and remove.

- **Pointless**
  - **Strobo**: Flashing lights. Speed and color.
  - **Existential Timer**: Counts seconds. Asks why. No answers.
  - **Click Counter**: Count clicks. Button moves. Pointless.
  - **Scroll sanctifier**: Scroll for ceremony, get a fake certificate. Nothing is saved.
  - **Coin flip**: Fair 50/50 coin flip. No history, no stakes.
  - **Dice**: Roll one, two, or three d6 and see the total.

### Tech Stack

- **Frontend**: React 19 with React Router v7
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4 with light/dark theme
- **Icons**: Phosphor React

### Getting Started

#### Prerequisites

- **Node.js** (v20+ recommended)
- **npm**, **pnpm**, or **yarn**

#### Installation

```bash
git clone <your-repo-url>
cd utilities
npm install        # or pnpm install / yarn
```

#### Development

```bash
npm run dev
```

Then open the printed local URL in your browser (usually `http://localhost:5173`).

#### Production build

```bash
npm run build
```

This outputs a static bundle in `dist/` with asset paths rooted at `/`, suitable for hosting at the site root (Apache with `public/.htaccess`, static hosts, or Node).

#### Preview

```bash
npm run preview
```

Preview the production build locally.

### Usage

- **Search tools**: Press `Ctrl+K` (or `Cmd+K` on Mac) to open the tools panel and search.
- **Theme**: Light/dark mode switcher in the header; defaults to your system preference.
- **Copy-friendly**: Most tools are optimized for quick copy of results.

### Contributing

Contributions are welcome and encouraged!

1. **Fork** the repo.
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/amazing-utility
   ```
3. **Commit your changes** with clear messages.
4. **Open a Pull Request** describing what you changed and why.

If you're unsure where to start, you can:

- Improve or add new utilities.
- Polish the UI/UX.
- Add tests or documentation.

### License

This project is open source under **The Unlicense**. See `LICENSE` for details.

### Acknowledgements

- Built for developers who love **simple, fast tools**.
- Icons by [Phosphor Icons](https://phosphoricons.com/).
