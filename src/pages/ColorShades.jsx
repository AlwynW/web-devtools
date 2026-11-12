import { useMemo, useState } from "react";
import { parse, formatHex, oklch, interpolate } from "culori";
import CopyButton from "../components/CopyButton";
import CopyPre from "../components/CopyPre";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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
      <PageHeader title="Color shades" description="OKLCH ramp from darker to lighter; copy hex table or CSS variables." />

      <Panel className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="field-label mb-1">
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
                className="h-10 w-12 shrink-0 cursor-pointer rounded-control border border-border-strong"
              />
              <input
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="min-w-0 flex-1 p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
              />
            </div>
          </div>
          <div>
            <label className="field-label mb-1">
              Steps (3–21)
            </label>
            <input
              type="number"
              min={3}
              max={21}
              value={steps}
              onChange={(e) => setSteps(+e.target.value || 9)}
              className="w-full p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
            />
          </div>
          <div>
            <label className="field-label mb-1">
              Lightness spread
            </label>
            <input
              type="number"
              step={0.05}
              min={0.1}
              max={0.5}
              value={spread}
              onChange={(e) => setSpread(+e.target.value || 0.42)}
              className="w-full p-2 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
            />
          </div>
        </div>

        {err && (
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">{err}</p>
        )}

        {!err && rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1 rounded-control overflow-hidden border border-border">
              {rows.map((r) => (
                <div
                  key={r.step}
                  className="h-12 flex-1 min-w-[2.5rem]"
                  style={{ backgroundColor: r.hex }}
                  title={r.hex}
                />
              ))}
            </div>
            <div className="border border-border rounded-control overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-hover-muted text-fg-muted">
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
                      className="border-t border-border group"
                    >
                      <td className="p-2">{r.step}</td>
                      <td className="p-2">{r.hex}</td>
                      <td className="p-2">
                        <CopyButton
                          text={r.hex}
                          onCopySuccess={() => onToast("Copied!")}
                          size={16}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <span className="field-label mb-2">
                CSS variables
              </span>
              <CopyPre
                text={cssVars}
                onCopySuccess={() => onToast("Copied!")}
                className="border border-border rounded-control bg-surface-code overflow-x-auto"
                preClassName="p-3 font-mono text-xs text-fg-soft"
              />
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
