import { useMemo, useRef, useState } from "react";
import { DownloadSimple, UploadSimple } from "phosphor-react";
import CopyPre from "../components/CopyPre";

const TABS = [
  { id: "optimize", label: "Optimize" },
  { id: "color", label: "Color" },
  { id: "path", label: "Path" },
  { id: "sprite", label: "Sprite" },
];

function optimizeSvg(input, idPrefix = "i") {
  let s = input.replace(/<!--[\s\S]*?-->/g, "");
  const doc = new DOMParser().parseFromString(s, "image/svg+xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid XML/SVG");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No <svg> root");

  ["metadata", "title", "desc"].forEach((tag) => {
    svg.querySelectorAll(tag).forEach((el) => el.remove());
  });

  const ids = [...svg.querySelectorAll("[id]")];
  const map = new Map();
  ids.forEach((el, i) => {
    const old = el.getAttribute("id");
    if (!old) return;
    const nid = `${idPrefix}${i}`;
    map.set(old, nid);
    el.setAttribute("id", nid);
  });

  let out = new XMLSerializer().serializeToString(svg);
  for (const [old, nid] of map) {
    const re = new RegExp(`url\\(#${escapeRe(old)}\\)`, "g");
    out = out.replace(re, `url(#${nid})`);
  }

  out = out
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const NON_PAINT = new Set([
  "none",
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "context-fill",
  "context-stroke",
]);

const FILL_STROKE = ["fill", "stroke"];
const ALL_COLOR_ATTRS = [
  "fill",
  "stroke",
  "color",
  "stop-color",
  "flood-color",
  "lighting-color",
];

function isPaintColor(value) {
  if (value == null) return false;
  const v = String(value).trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  if (NON_PAINT.has(lower)) return false;
  if (lower.startsWith("url(") || lower.startsWith("var(")) return false;
  return true;
}

function parseSvgDoc(input) {
  const doc = new DOMParser().parseFromString(input, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML/SVG");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No <svg> root");
  return svg;
}

function mapStylePaints(style, attrSet, next) {
  return style
    .split(";")
    .map((part) => {
      const idx = part.indexOf(":");
      if (idx === -1) return part;
      const name = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (!attrSet.has(name.toLowerCase()) || !isPaintColor(val)) return part;
      const lead = part.match(/^\s*/)?.[0] ?? "";
      return `${lead}${name}: ${next}`;
    })
    .join(";");
}

function mapCssPaints(css, attrs, next) {
  const propRe = attrs.map(escapeRe).join("|");
  return css.replace(
    new RegExp(`(^|[;{\\s])(${propRe})(\\s*:\\s*)([^;}{]+)`, "gi"),
    (full, lead, prop, mid, val) => {
      if (!isPaintColor(val)) return full;
      return `${lead}${prop}${mid}${next}`;
    },
  );
}

function rewriteSvgPaints(input, attrs, next) {
  const svg = parseSvgDoc(input);
  const attrSet = new Set(attrs.map((a) => a.toLowerCase()));
  let count = 0;

  const consider = (value) => isPaintColor(value);

  for (const el of [svg, ...svg.querySelectorAll("*")]) {
    for (const attr of [...el.attributes]) {
      const key = attr.name.toLowerCase();
      if (!attrSet.has(key)) continue;
      if (!consider(attr.value)) continue;
      el.setAttribute(attr.name, next);
      count += 1;
    }
    const style = el.getAttribute("style");
    if (style) {
      const mapped = mapStylePaints(style, attrSet, next);
      if (mapped !== style) {
        count += 1;
        el.setAttribute("style", mapped);
      }
    }
    if (el.tagName.toLowerCase() === "style" && el.textContent) {
      const mapped = mapCssPaints(el.textContent, attrs, next);
      if (mapped !== el.textContent) {
        count += 1;
        el.textContent = mapped;
      }
    }
  }

  return { svg: new XMLSerializer().serializeToString(svg), count };
}

function buildSprite(text, idBase = "icon") {
  const chunks = text
    .split(/\n---\n/g)
    .map((x) => x.trim())
    .filter(Boolean);
  if (!chunks.length) throw new Error("Paste SVGs separated by a line with only ---");

  const symbols = [];
  let vbGlobal = "0 0 24 24";

  chunks.forEach((chunk, idx) => {
    const doc = new DOMParser().parseFromString(chunk, "image/svg+xml");
    if (doc.querySelector("parsererror")) return;
    const svg = doc.querySelector("svg");
    if (!svg) return;
    const vb = svg.getAttribute("viewBox");
    if (idx === 0 && vb) vbGlobal = vb;
    const sid = `${idBase}-${idx + 1}`;
    const inner = [...svg.childNodes]
      .map((n) => new XMLSerializer().serializeToString(n))
      .join("");
    symbols.push(
      `<symbol id="${sid}" viewBox="${vb || vbGlobal}" xmlns="http://www.w3.org/2000/svg">${inner}</symbol>`,
    );
  });

  if (!symbols.length) throw new Error("No valid SVGs found");

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vbGlobal}" style="display:none">\n${symbols.join("\n")}\n</svg>`;
  const uses = symbols
    .map((_, i) => `<!-- <use href="#${idBase}-${i + 1}" width="24" height="24" /> -->`)
    .join("\n");
  return { sprite, uses };
}

function isSvgFile(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (type === "image/svg+xml" || type === "image/svg") return true;
  return /\.svg$/i.test(file.name || "");
}

function readSvgText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").replace(/^\uFEFF/, ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

function SvgFileDrop({ multiple = false, onFiles, onError }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const takeFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(isSvgFile);
    if (!files.length) {
      onError?.("Use an .svg file.");
      return;
    }
    try {
      const texts = await Promise.all(files.map(readSvgText));
      onFiles(texts, files);
    } catch (e) {
      onError?.(e.message || "Failed to read file");
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        takeFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-stone-500 bg-stone-100/50 dark:bg-stone-800/50"
          : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          takeFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        <UploadSimple size={28} weight="thin" className="text-stone-400" />
        <span className="font-mono text-xs text-stone-600 dark:text-stone-300">
          {multiple
            ? "Drop SVG files here or click to browse"
            : "Drop an SVG here or click to browse"}
        </span>
      </div>
    </div>
  );
}

function svgFileName(name, fallback) {
  const base = (name || fallback || "image").replace(/\.svg$/i, "").trim() || "image";
  return `${base}.svg`;
}

function downloadSvg(markup, filename, onToast) {
  if (!markup) return;
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = svgFileName(filename, "image");
  a.click();
  URL.revokeObjectURL(url);
  onToast?.("Downloaded SVG");
}

function DownloadSvgButton({ text, filename, onToast }) {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() => downloadSvg(text, filename, onToast)}
      className="flex items-center gap-2 px-4 py-2 font-mono text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
    >
      <DownloadSimple size={16} weight="thin" />
      Download SVG
    </button>
  );
}

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function pathToSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><path d="${escapeXmlAttr(d)}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
}

export default function SvgTools({ onToast }) {
  const [tab, setTab] = useState("optimize");
  const [optIn, setOptIn] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>x</title><circle id="a" cx="50" cy="50" r="40"/></svg>',
  );
  const [optOut, setOptOut] = useState("");
  const [optErr, setOptErr] = useState(null);
  const [optFileName, setOptFileName] = useState("optimized.svg");
  const [pathD, setPathD] = useState("M10 80 Q 50 10 90 80 T 170 80");
  const [spriteIn, setSpriteIn] = useState("");
  const [spriteResult, setSpriteResult] = useState({ sprite: "", uses: "" });
  const [spriteErr, setSpriteErr] = useState(null);
  const [colorIn, setColorIn] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#3b82f6" stroke="#1e3a8a" stroke-width="6"/><path d="M20 80h60" fill="none" stroke="#ef4444" stroke-width="4"/></svg>',
  );
  const [colorOut, setColorOut] = useState("");
  const [colorErr, setColorErr] = useState(null);
  const [colorFileName, setColorFileName] = useState("recolored.svg");
  const [recolor, setRecolor] = useState("#111111");

  const runOptimize = () => {
    setOptErr(null);
    try {
      setOptOut(optimizeSvg(optIn));
      onToast?.("Optimized");
    } catch (e) {
      setOptErr(e.message || "Failed");
    }
  };

  const runSprite = () => {
    setSpriteErr(null);
    try {
      const r = buildSprite(spriteIn);
      setSpriteResult(r);
      onToast?.("Sprite built");
    } catch (e) {
      setSpriteErr(e.message || "Failed");
    }
  };

  const runCurrentColor = () => {
    setColorErr(null);
    try {
      const { svg, count } = rewriteSvgPaints(colorIn, FILL_STROKE, "currentColor");
      setColorOut(svg);
      onToast?.(count ? `Set ${count} paint${count === 1 ? "" : "s"} to currentColor` : "No defined fills or strokes");
    } catch (e) {
      setColorErr(e.message || "Failed");
    }
  };

  const runRecolor = () => {
    setColorErr(null);
    try {
      const { svg, count } = rewriteSvgPaints(colorIn, ALL_COLOR_ATTRS, recolor);
      setColorOut(svg);
      onToast?.(count ? `Updated ${count} color${count === 1 ? "" : "s"}` : "No color values found");
    } catch (e) {
      setColorErr(e.message || "Failed");
    }
  };

  const pathPreview = useMemo(() => {
    const d = pathD.trim();
    if (!d) return null;
    return (
      <svg
        viewBox="0 0 200 120"
        className="w-full max-w-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-950"
      >
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-stone-900 dark:text-stone-100"
        />
      </svg>
    );
  }, [pathD]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          SVG tools
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Optimize/minify, recolor, edit path <code className="text-stone-600 dark:text-stone-300">d</code>, build a
          symbol sprite. Paste or upload SVG.
        </p>
      </header>

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 transition-colors ${
              tab === t.id
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "optimize" && (
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <SvgFileDrop
            onFiles={(texts, files) => {
              setOptErr(null);
              setOptIn(texts[0]);
              if (files[0]?.name) setOptFileName(svgFileName(files[0].name, "optimized"));
              onToast?.(files[0]?.name ? `Loaded ${files[0].name}` : "Loaded SVG");
            }}
            onError={(msg) => {
              setOptErr(msg);
              onToast?.(msg);
            }}
          />
          <textarea
            value={optIn}
            onChange={(e) => setOptIn(e.target.value)}
            rows={8}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          <button
            type="button"
            onClick={runOptimize}
            className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
          >
            Optimize
          </button>
          {optErr && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">{optErr}</p>
          )}
          {optOut && (
            <>
              <DownloadSvgButton text={optOut} filename={optFileName} onToast={onToast} />
              <CopyPre
                text={optOut}
                onCopySuccess={() => onToast("Copied!")}
                title="Copy output"
                className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-48 overflow-y-auto"
                preClassName="p-4 font-mono text-xs break-all whitespace-pre-wrap text-stone-800 dark:text-stone-200"
              />
            </>
          )}
        </div>
      )}

      {tab === "color" && (
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <SvgFileDrop
            onFiles={(texts, files) => {
              setColorErr(null);
              setColorIn(texts[0]);
              if (files[0]?.name) setColorFileName(svgFileName(files[0].name, "recolored"));
              onToast?.(files[0]?.name ? `Loaded ${files[0].name}` : "Loaded SVG");
            }}
            onError={(msg) => {
              setColorErr(msg);
              onToast?.(msg);
            }}
          />
          <textarea
            value={colorIn}
            onChange={(e) => setColorIn(e.target.value)}
            rows={8}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runCurrentColor}
              className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
            >
              Use currentColor
            </button>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(recolor.trim())
                    ? recolor.trim()
                    : "#111111"
                }
                onChange={(e) => setRecolor(e.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer border border-stone-300 dark:border-stone-600 bg-transparent"
                aria-label="Replacement color"
              />
              <input
                value={recolor}
                onChange={(e) => setRecolor(e.target.value)}
                className="w-28 p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={runRecolor}
                className="px-4 py-2 font-mono text-xs border border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900"
              >
                Apply color
              </button>
            </div>
          </div>
          <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            currentColor only rewrites defined fills and strokes. Apply color replaces all paint
            colors. <code className="text-stone-600 dark:text-stone-300">none</code>,{" "}
            <code className="text-stone-600 dark:text-stone-300">transparent</code>, and{" "}
            <code className="text-stone-600 dark:text-stone-300">url()</code> are left alone.
          </p>
          {colorErr && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">{colorErr}</p>
          )}
          {colorOut && (
            <>
              <div
                className="p-6 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 flex justify-center text-stone-900 dark:text-stone-100 [&_svg]:max-h-40 [&_svg]:max-w-full [&_svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: colorOut }}
              />
              <DownloadSvgButton text={colorOut} filename={colorFileName} onToast={onToast} />
              <CopyPre
                text={colorOut}
                onCopySuccess={() => onToast("Copied!")}
                title="Copy output"
                className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-48 overflow-y-auto"
                preClassName="p-4 font-mono text-xs break-all whitespace-pre-wrap text-stone-800 dark:text-stone-200"
              />
            </>
          )}
        </div>
      )}

      {tab === "path" && (
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
            d attribute
          </label>
          <textarea
            value={pathD}
            onChange={(e) => setPathD(e.target.value)}
            rows={4}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          <div className="flex justify-center">{pathPreview}</div>
          {pathD.trim() && (
            <DownloadSvgButton
              text={pathToSvg(pathD.trim())}
              filename="path.svg"
              onToast={onToast}
            />
          )}
        </div>
      )}

      {tab === "sprite" && (
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <p className="text-xs font-mono text-stone-500">
            Paste multiple SVGs separated by a line containing only{" "}
            <code className="text-stone-600 dark:text-stone-300">---</code>, or upload several files.
          </p>
          <SvgFileDrop
            multiple
            onFiles={(texts, files) => {
              setSpriteErr(null);
              const joined = texts.join("\n---\n");
              setSpriteIn((prev) => (prev.trim() ? `${prev.trim()}\n---\n${joined}` : joined));
              onToast?.(
                files.length === 1
                  ? `Loaded ${files[0].name}`
                  : `Loaded ${files.length} SVGs`,
              );
            }}
            onError={(msg) => {
              setSpriteErr(msg);
              onToast?.(msg);
            }}
          />
          <textarea
            value={spriteIn}
            onChange={(e) => setSpriteIn(e.target.value)}
            rows={10}
            placeholder={'<svg ...>...</svg>\n---\n<svg ...>...</svg>'}
            className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
          <button
            type="button"
            onClick={runSprite}
            className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
          >
            Build sprite
          </button>
          {spriteErr && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">{spriteErr}</p>
          )}
          {spriteResult.sprite && (
            <>
              <span className="block text-[11px] font-mono text-stone-500 mb-2">Sprite</span>
              <DownloadSvgButton text={spriteResult.sprite} filename="sprite.svg" onToast={onToast} />
              <CopyPre
                text={spriteResult.sprite}
                onCopySuccess={() => onToast("Copied!")}
                className="border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 max-h-40 overflow-y-auto"
                preClassName="p-4 font-mono text-xs break-all whitespace-pre-wrap text-stone-800 dark:text-stone-200"
              />
              <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-[11px] text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                {spriteResult.uses}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
