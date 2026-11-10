import { Marked } from "marked";

const DIAGRAM_FONT = '"Space Grotesk", system-ui, sans-serif';

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

function themeVariables(dark) {
  if (dark) {
    return {
      darkMode: true,
      background: "transparent",
      fontFamily: DIAGRAM_FONT,
      primaryColor: "#44403c",
      primaryTextColor: "#fafaf9",
      primaryBorderColor: "#a8a29e",
      secondaryColor: "#292524",
      secondaryTextColor: "#fafaf9",
      secondaryBorderColor: "#a8a29e",
      tertiaryColor: "#1c1917",
      tertiaryTextColor: "#e7e5e4",
      tertiaryBorderColor: "#78716c",
      lineColor: "#d6d3d1",
      textColor: "#fafaf9",
      mainBkg: "#44403c",
      nodeBorder: "#a8a29e",
      clusterBkg: "#292524",
      clusterBorder: "#78716c",
      titleColor: "#fafaf9",
      edgeLabelBackground: "#1c1917",
      actorBkg: "#44403c",
      actorBorder: "#a8a29e",
      actorTextColor: "#fafaf9",
      actorLineColor: "#d6d3d1",
      signalColor: "#d6d3d1",
      signalTextColor: "#fafaf9",
      labelBoxBkgColor: "#44403c",
      labelBoxBorderColor: "#a8a29e",
      labelTextColor: "#fafaf9",
      loopTextColor: "#fafaf9",
      noteBkgColor: "#292524",
      noteTextColor: "#fafaf9",
      noteBorderColor: "#a8a29e",
      activationBkgColor: "#57534e",
      activationBorderColor: "#d6d3d1",
      sequenceNumberColor: "#fafaf9",
    };
  }

  return {
    darkMode: false,
    background: "transparent",
    fontFamily: DIAGRAM_FONT,
    primaryColor: "#f5f5f4",
    primaryTextColor: "#1c1917",
    primaryBorderColor: "#57534e",
    secondaryColor: "#e7e5e4",
    secondaryTextColor: "#1c1917",
    secondaryBorderColor: "#78716c",
    tertiaryColor: "#fafaf9",
    tertiaryTextColor: "#44403c",
    tertiaryBorderColor: "#a8a29e",
    lineColor: "#44403c",
    textColor: "#1c1917",
    mainBkg: "#f5f5f4",
    nodeBorder: "#57534e",
    clusterBkg: "#fafaf9",
    clusterBorder: "#a8a29e",
    titleColor: "#1c1917",
    edgeLabelBackground: "#ffffff",
    actorBkg: "#f5f5f4",
    actorBorder: "#57534e",
    actorTextColor: "#1c1917",
    actorLineColor: "#57534e",
    signalColor: "#44403c",
    signalTextColor: "#1c1917",
    labelBoxBkgColor: "#f5f5f4",
    labelBoxBorderColor: "#57534e",
    labelTextColor: "#1c1917",
    loopTextColor: "#1c1917",
    noteBkgColor: "#fafaf9",
    noteTextColor: "#1c1917",
    noteBorderColor: "#a8a29e",
    activationBkgColor: "#e7e5e4",
    activationBorderColor: "#57534e",
    sequenceNumberColor: "#1c1917",
  };
}

function mermaidConfig(dark) {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    htmlLabels: true,
    fontFamily: DIAGRAM_FONT,
    theme: "base",
    themeVariables: themeVariables(dark),
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
