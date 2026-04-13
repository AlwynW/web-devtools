import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  GITIGNORE_PRESETS,
  PRESET_LABELS,
} from "../data/gitignorePresets";

const IDS = Object.keys(GITIGNORE_PRESETS);

function mergeLines(selectedIds) {
  const seen = new Set();
  const out = [];
  for (const id of selectedIds) {
    const lines = GITIGNORE_PRESETS[id] || [];
    for (const line of lines) {
      const t = line.trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export default function GitignoreComposer({ onToast }) {
  const [selected, setSelected] = useState(() => new Set(["node"]));
  const [extra, setExtra] = useState("");

  const toggle = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const content = useMemo(() => {
    const lines = mergeLines([...selected]);
    const extraLines = extra
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const l of extraLines) {
      if (!lines.includes(l)) lines.push(l);
    }
    const body = lines.join("\n");
    return body ? `# DevKit .gitignore\n${body}\n` : "";
  }, [selected, extra]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          .gitignore
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Combine preset blocks and your own lines; duplicates removed.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-3">
            Presets
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {IDS.map((id) => (
              <label
                key={id}
                className="flex items-center gap-2 cursor-pointer font-mono text-sm text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 p-2 hover:bg-stone-50 dark:hover:bg-stone-950"
              >
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggle(id)}
                />
                {PRESET_LABELS[id] || id}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
            Extra lines (one per row)
          </label>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={4}
            placeholder="custom-folder/"
            className="w-full p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
              Preview
            </span>
            <button
              type="button"
              onClick={() =>
                content &&
                copyToClipboard(content, () => onToast("Copied!"))
              }
              className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs whitespace-pre-wrap text-stone-800 dark:text-stone-200 max-h-64 overflow-y-auto">
            {content || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
