import { useMemo, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

export default function ClampGenerator({ onToast }) {
  const [minPx, setMinPx] = useState(16);
  const [maxPx, setMaxPx] = useState(48);
  const [vpMin, setVpMin] = useState(320);
  const [vpMax, setVpMax] = useState(1280);
  const [unit, setUnit] = useState("rem");
  const [rootPx, setRootPx] = useState(16);

  const { preferredVw, clampCss, samples } = useMemo(() => {
    const min = Number(minPx) || 0;
    const max = Number(maxPx) || 0;
    const vmin = Number(vpMin) || 320;
    const vmax = Number(vpMax) || 1280;
    const root = Number(rootPx) || 16;

    const toUnit = (px) => {
      if (unit === "rem") return `${(px / root).toFixed(4)}rem`;
      if (unit === "px") return `${px}px`;
      return `${px}px`;
    };

    const slope = (max - min) / (vmax - vmin);
    const vwPart = slope * 100;
    const interceptPx = min - slope * vmin;
    const interceptRem = interceptPx / root;
    const preferredVwVal = vwPart;
    const interceptStr =
      unit === "rem"
        ? `${interceptRem.toFixed(4)}rem`
        : `${interceptPx.toFixed(2)}px`;

    const minStr = toUnit(min);
    const maxStr = toUnit(max);
    const clampCssVal = `clamp(${minStr}, ${preferredVwVal.toFixed(4)}vw + ${interceptStr}, ${maxStr})`;

    const evalClamp = (vpW) => {
      const px = interceptPx + (preferredVwVal / 100) * vpW;
      return Math.round(Math.min(max, Math.max(min, px)) * 100) / 100;
    };

    const sampleWidths = [vmin, (vmin + vmax) / 2, vmax, 375, 768, 1024].filter(
      (w, i, arr) => w >= vmin && w <= vmax && arr.indexOf(w) === i,
    );

    return {
      preferredVw: preferredVwVal,
      clampCss: clampCssVal,
      samples: sampleWidths.map((w) => ({ w, px: evalClamp(w) })),
    };
  }, [minPx, maxPx, vpMin, vpMax, unit, rootPx]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          CSS clamp()
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Linear fluid sizing between viewport bounds (min/max in px, output rem
          or px).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6 font-mono text-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Min (px)
            </label>
            <input
              type="number"
              value={minPx}
              onChange={(e) => setMinPx(+e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Max (px)
            </label>
            <input
              type="number"
              value={maxPx}
              onChange={(e) => setMaxPx(+e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Viewport min (px)
            </label>
            <input
              type="number"
              value={vpMin}
              onChange={(e) => setVpMin(+e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Viewport max (px)
            </label>
            <input
              type="number"
              value={vpMax}
              onChange={(e) => setVpMax(+e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Output unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            >
              <option value="rem">rem</option>
              <option value="px">px</option>
            </select>
          </div>
          {unit === "rem" && (
            <div>
              <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
                Root font size (px)
              </label>
              <input
                type="number"
                value={rootPx}
                onChange={(e) => setRootPx(+e.target.value)}
                className="w-24 p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] text-stone-500 uppercase tracking-[0.18em]">
              Result
            </label>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(clampCss, () => onToast("Copied!"))
              }
              className="text-[11px] underline text-stone-600 dark:text-stone-400"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs break-all whitespace-pre-wrap">
            {clampCss}
          </pre>
          <p className="text-[11px] text-stone-500 mt-2">
            vw slope ≈ {preferredVw.toFixed(3)} (linear interpolation in px
            space)
          </p>
        </div>

        <div>
          <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-2">
            Computed size at sample widths (px)
          </label>
          <ul className="text-xs space-y-1 border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-950 max-h-40 overflow-y-auto">
            {samples.map(({ w, px }) => (
              <li key={w}>
                {w}px viewport → <strong>{px}px</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
