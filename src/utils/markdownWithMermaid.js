import { Marked } from "marked";


let renderQueue = Promise.resolve();
let renderSeq = 0;

function enqueue(task) {
  const run = renderQueue.then(task, task);
  renderQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}

function codeLanguage(lang) {
  return String(lang || "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function diagramErrorMessage(error) {
  const raw = String(error?.message || error || "Invalid diagram");
  const line = raw
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return (line || "Invalid diagram").replace(/^Error:\s*/, "");
}

function errorBlock(message) {
  return `<div class="mermaid-diagram mermaid-diagram-error" role="alert"><p class="mermaid-error-title">Could not render this diagram</p><p class="mermaid-error-message">${escapeHtml(message)}</p></div>`;
}

// Mermaid derives shades from these, so it needs resolved colors, not var().
// Keep the tokens read here as plain hex in tokens.css (no color-mix).
function themeVariables(dark) {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  const fill = token("--surface");
  const fillMuted = token("--surface-sunken");
  const text = token("--fg");
  const textMuted = token("--fg-muted");
  const border = token("--border-muted");
  const line = token("--fg-soft");
  return {
    darkMode: dark,
    background: "transparent",
    fontFamily: token("--font-sans"),
    primaryColor: fill,
    primaryTextColor: text,
    primaryBorderColor: border,
    secondaryColor: fillMuted,
    secondaryTextColor: text,
    secondaryBorderColor: border,
    tertiaryColor: token("--shell"),
    tertiaryTextColor: textMuted,
    tertiaryBorderColor: border,
    lineColor: line,
    textColor: text,
    mainBkg: fill,
    nodeBorder: border,
    clusterBkg: fillMuted,
    clusterBorder: border,
    titleColor: text,
    edgeLabelBackground: token("--shell"),
    actorBkg: fill,
    actorBorder: border,
    actorTextColor: text,
    actorLineColor: line,
    signalColor: line,
    signalTextColor: text,
    labelBoxBkgColor: fill,
    labelBoxBorderColor: border,
    labelTextColor: text,
    loopTextColor: text,
    noteBkgColor: token("--primary"),
    noteTextColor: token("--primary-fg"),
    noteBorderColor: token("--primary-border"),
    activationBkgColor: fillMuted,
    activationBorderColor: line,
    sequenceNumberColor: token("--primary-fg"),
  };
}

function mermaidConfig(dark) {
  const themeVars = themeVariables(dark);
  return {
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    htmlLabels: true,
    fontFamily: themeVars.fontFamily,
    theme: "base",
    themeVariables: themeVars,
  };
}

function cleanupMermaidNode(id) {
  document.getElementById(id)?.remove();
  document.getElementById(`d${id}`)?.remove();
}

async function renderDiagram(mermaid, source) {
  const trimmed = String(source ?? "");
  if (!trimmed.trim()) return errorBlock("Diagram is empty");

  const id = `md-mermaid-${++renderSeq}`;
  try {
    const { svg } = await mermaid.render(id, trimmed);
    return `<div class="mermaid-diagram">${svg}</div>`;
  } catch (error) {
    return errorBlock(diagramErrorMessage(error));
  } finally {
    cleanupMermaidNode(id);
  }
}

async function renderDiagrams(sources, dark) {
  return enqueue(async () => {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize(mermaidConfig(dark));
    const rendered = [];
    for (const source of sources) {
      rendered.push(await renderDiagram(mermaid, source));
    }
    return rendered;
  });
}

/**
 * Parse Markdown to HTML and replace ```mermaid fences with rendered diagrams.
 * Other fenced code stays as code. A broken diagram becomes an inline error
 * and does not fail the rest of the document.
 */
export async function renderMarkdownWithMermaid(markdown, { dark = false } = {}) {
  const diagrams = [];
  const parser = new Marked();
  parser.use({
    renderer: {
      code({ text, lang }) {
        if (codeLanguage(lang) !== "mermaid") return false;
        const index = diagrams.length;
        diagrams.push(text);
        return `<div class="mermaid-pending" data-mermaid-index="${index}"></div>\n`;
      },
    },
  });

  const html = await parser.parse(String(markdown ?? ""));
  if (diagrams.length === 0) return html;

  const rendered = await renderDiagrams(diagrams, dark);
  return html.replace(
    /<div class="mermaid-pending" data-mermaid-index="(\d+)"><\/div>/g,
    (match, index) => rendered[Number(index)] ?? match,
  );
}
