import { useMemo, useState } from "react";
import { parse, formatHex, oklch, interpolate } from "culori";
import { copyToClipboard } from "../utils/clipboard";

export default function ColorShades({ onToast }) {
  const [hex, setHex] = useState("#6366f1");
  const [steps, setSteps] = useState(9);
  const [spread, setSpread] = useState(0.42);

  const { rows, cssVars, err } = useMemo(() => {
    const p = parse(hex.trim());
    if (!p) {
      return { rows: [], cssVars: "", err: "Invalid color" };
    }
    const o = oklch(p);
    if (!o || o.l == null) {
      return { rows: [], cssVars: "", err: "Could not convert to OKLCH" };
    }
    const n = Math.min(21, Math.max(3, Math.floor(steps) || 9));
    const half = spread;
    const darkEnd = { ...o, l: Math.max(0.02, o.l - half) };
    const lightEnd = { ...o, l: Math.min(0.99, o.l + half) };
    const mix = interpolate([darkEnd, lightEnd], "oklch");
    const list = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const c = mix(t);
      const h = formatHex(c);
      if (h) list.push({ step: i + 1, hex: h });
    }
    const vars = list
      .map((r, i) => `  --shade-${i + 1}: ${r.hex};`)
      .join("\n");
    return {
      rows: list,
      cssVars: `:root {\n${vars}\n}`,
      err: null,
    };
  }, [hex, steps, spread]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Color shades
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          OKLCH ramp from darker to lighter; copy hex table or CSS variables.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
              Base
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={
                  (() => {
                    const p = parse(hex.trim());
                    const h = p ? formatHex(p) : null;
                    const m = h?.match(/^#([0-9a-f]{6})/i);
                    return m ? `#${m[1]}`.toLowerCase() : "#6366f1";
                  })()
                }
                onChange={(e) => setHex(e.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer rounded border border-stone-300 dark:border-stone-600"
              />
              <input
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="min-w-0 flex-1 p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
              Steps (3–21)
            </label>
            <input
              type="number"
              min={3}
              max={21}
              value={steps}
              onChange={(e) => setSteps(+e.target.value || 9)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-1">
              Lightness spread
            </label>
            <input
              type="number"
              step={0.05}
              min={0.1}
              max={0.5}
              value={spread}
              onChange={(e) => setSpread(+e.target.value || 0.42)}
              className="w-full p-2 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {err && (
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">{err}</p>
        )}

        {!err && rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1 rounded overflow-hidden border border-stone-200 dark:border-stone-700">
              {rows.map((r) => (
                <div
                  key={r.step}
                  className="h-12 flex-1 min-w-[2.5rem]"
                  style={{ backgroundColor: r.hex }}
                  title={r.hex}
                />
              ))}
            </div>
            <table className="w-full text-left font-mono text-xs border border-stone-200 dark:border-stone-700">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-500">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Hex</th>
                  <th className="p-2 w-20" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.step}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="p-2">{r.step}</td>
                    <td className="p-2">{r.hex}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(r.hex, () => onToast("Copied!"))
                        }
                        className="underline text-stone-500"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
                  CSS variables
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(cssVars, () => onToast("Copied!"))
                  }
                  className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs text-stone-800 dark:text-stone-200 overflow-x-auto">
                {cssVars}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
