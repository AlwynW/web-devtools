## DevKit – Modern Developer Utilities

DevKit is a sleek, browser-based toolbox for everyday developer tasks. It bundles a collection of generators, converters, validators, and reference tools into a single, fast interface so you don't have to keep ten tabs and five CLI commands open just to get simple things done.

[Demo](https://dev.alwyn.be)

### Features

- **Generate**
  - **Password**: Generate strong, random passwords.
  - **UUID Gen**: Create RFC-compliant UUIDs.
  - **Timestamp**: Convert to/from Unix timestamps.
  - **Persona**: Quickly spin up fake personas for testing.
  - **Lorem**: Generate lorem ipsum placeholder text.
  - **Crontab**: Build and understand cron expressions.
  - **Slug**: Convert text to URL-friendly slugs with full options.
  - **Meta Tags**: Generate Open Graph and Twitter Card meta tags.

- **CSS tools**
  - **CSS Shadow/Gradient**: Design shadows and gradients and copy the CSS.
  - **Grid**: Experiment with CSS grid layouts.
  - **Perfect Border**: Tweak border radius until it looks just right.
  - **Color**: Explore and convert colors for your UI.

- **Encode / Decode**
  - **QR Code**: Generate QR codes from text/URLs.
  - **Base64 / Base64 Image**: Encode/decode text and images.
  - **URL**: URL-encode and decode strings.
  - **JWT**: Inspect JSON Web Tokens.
  - **HTML Entity**: Convert text to/from HTML entities.
  - **Hash**: Create hashes for strings.
  - **Escape/Unescape**: Escape strings for JSON, regex, SQL, HTML, shell.
  - **Hex Converter**: Convert between hex, binary, decimal, octal.
  - **Password Hash**: Hash passwords with bcrypt and verify.

- **Convert / Validate**
  - **JSON**: Pretty-print, minify, and validate JSON.
  - **Markdown/HTML**: Convert between Markdown and HTML.
  - **YAML/JSON**: Convert between YAML and JSON.
  - **CSV/JSON**: Convert between CSV and JSON.

- **Tools**
  - **Regex**: Build and test regular expressions.
  - **Markdown Viewer**: Render Markdown for quick previews.
  - **Favicon**: Generate favicons from text or emoji.
  - **URL Parser**: Parse and build URLs with query params.
  - **Morse Code**: Encode/decode Morse with reference table and spacebar input.

- **Reference**
  - **HTTP Status**: Look up HTTP status codes.
  - **Tailwind**: Quick Tailwind CSS reference.
  - **My IP**: Show your public IP address.
  - **Git Cheatsheet**: Quick reference for common Git commands.
  - **SQL Formatter**: Format and minify SQL queries.
  - **ASCII Table**: Look up character codes and symbols.

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

This outputs a static bundle. The build uses `--base=/dev/` by default, so deploy to a path like `/dev/` on your host (e.g. Netlify, Vercel, GitHub Pages).

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
