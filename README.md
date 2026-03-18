## DevKit – Modern Developer Utilities

DevKit is a sleek, browser-based toolbox for everyday developer tasks. It bundles a collection of generators, converters, validators, and reference tools into a single, fast interface so you don’t have to keep ten tabs and five CLI commands open just to get simple things done.

### Features

- **Generate**
  - **Password**: Generate strong, random passwords.
  - **UUID Gen**: Create RFC-compliant UUIDs.
  - **Timestamp**: Convert to/from Unix timestamps.
  - **Persona**: Quickly spin up fake personas for testing.
  - **Lorem**: Generate lorem ipsum placeholder text.
  - **Crontab**: Build and understand cron expressions.

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

- **Convert / Validate**
  - **JSON**: Pretty-print, minify, and validate JSON.
  - **Markdown/HTML**: Convert between Markdown and HTML.

- **Tools**
  - **Regex**: Build and test regular expressions.
  - **MD Viewer**: Render Markdown for quick previews.

- **Reference**
  - **HTTP Status**: Look up HTTP status codes.
  - **Tailwind**: Quick Tailwind CSS reference.
  - **My IP**: Show your public IP address.

### Tech Stack

- **Frontend**: React with `react-router-dom`
- **Styling**: Tailwind CSS with a modern dark/light UI
- **Icons**: `lucide-react`

### Getting Started

#### Prerequisites

- **Node.js** (LTS recommended)
- **npm**, **pnpm**, or **yarn**

#### Installation

```bash
git clone https://github.com/<your-org-or-user>/devkit.git
cd devkit
npm install        # or pnpm install / yarn
```

#### Development

```bash
npm run dev
```

Then open the printed local URL in your browser (usually `http://localhost:5173` or `http://localhost:3000`, depending on your setup).

#### Production build

```bash
npm run build
```

This will output a static bundle you can deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

### Usage

- **Navigate the sidebar** to jump between tools.
- **Copy/paste friendly**: most tools are optimized for quick copy of results.
- **Dark mode ready**: respects the app’s dark theme styling.

### Contributing

Contributions are welcome and encouraged!

1. **Fork** the repo.
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/amazing-utility
   ```
3. **Commit your changes** with clear messages.
4. **Open a Pull Request** describing what you changed and why.

If you’re unsure where to start, you can:

- Improve or add new utilities.
- Polish the UI/UX.
- Add tests or documentation.

### License

This project is open source under the **The Unlicense**. See `LICENSE` (or create one if it’s missing) for details.

### Acknowledgements

- Built for developers who love **simple, fast tools**.
- Icons by `lucide-react`.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
