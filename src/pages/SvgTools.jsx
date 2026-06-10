import { useMemo, useState } from "react";
import CopyPre from "../components/CopyPre";

const TABS = [
  { id: "optimize", label: "Optimize" },
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

export default function SvgTools({ onToast }) {
  const [tab, setTab] = useState("optimize");
  const [optIn, setOptIn] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>x</title><circle id="a" cx="50" cy="50" r="40"/></svg>',
  );
  const [optOut, setOptOut] = useState("");
  const [optErr, setOptErr] = useState(null);
  const [pathD, setPathD] = useState("M10 80 Q 50 10 90 80 T 170 80");
  const [spriteIn, setSpriteIn] = useState("");
  const [spriteResult, setSpriteResult] = useState({ sprite: "", uses: "" });
  const [spriteErr, setSpriteErr] = useState(null);

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
          Optimize/minify, edit path <code className="text-stone-600 dark:text-stone-300">d</code>, build a
          symbol sprite.
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
        </div>
      )}

      {tab === "sprite" && (
        <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <p className="text-xs font-mono text-stone-500">
            Paste multiple SVGs separated by a line containing only{" "}
            <code className="text-stone-600 dark:text-stone-300">---</code>.
          </p>
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
