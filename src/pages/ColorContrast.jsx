import { useMemo, useState, useCallback } from "react";
import { parse, formatRgb, formatHex, converter } from "culori";

const toRgb = converter("rgb");

function relativeLuminance({ r, g, b }) {
  const lin = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(l1, l2) {
  const L1 = Math.max(l1, l2);
  const L2 = Math.min(l1, l2);
  return (L1 + 0.05) / (L2 + 0.05);
}

function passesAA(ratio, large) {
  return large ? ratio >= 3 : ratio >= 4.5;
}

function passesAAA(ratio, large) {
  return large ? ratio >= 4.5 : ratio >= 7;
}

/** Hex string suitable for `<input type="color">` (#rrggbb only). */
function toPickerHex(str) {
  const p = parse(String(str).trim());
  if (!p) return "#000000";
  const hex = formatHex(p);
  if (!hex) return "#000000";
  const m = hex.match(/^#([0-9a-f]{6})/i);
  return m ? `#${m[1]}`.toLowerCase() : "#000000";
}

export default function ColorContrast() {
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");

  const pickerFg = useMemo(() => toPickerHex(fg), [fg]);
  const pickerBg = useMemo(() => toPickerHex(bg), [bg]);

  const { ratio, rgbFg, rgbBg, err } = useMemo(() => {
    const pf = parse(fg.trim());
    const pb = parse(bg.trim());
    if (!pf || !pb) {
      return { ratio: null, rgbFg: null, rgbBg: null, err: "Invalid color" };
    }
    const rf = toRgb(pf);
    const rb = toRgb(pb);
    if (!rf || !rb) {
      return { ratio: null, rgbFg: null, rgbBg: null, err: "Could not convert" };
    }
    const lf = relativeLuminance(rf);
    const lb = relativeLuminance(rb);
    const r = contrastRatio(lf, lb);
    return {
      ratio: Math.round(r * 100) / 100,
      rgbFg: rf,
      rgbBg: rb,
      err: null,
    };
  }, [fg, bg]);

  const sampleStyle = useCallback(() => {
    if (!rgbFg || !rgbBg) return {};
    return {
      color: formatRgb(rgbFg),
      backgroundColor: formatRgb(rgbBg),
    };
  }, [rgbFg, rgbBg]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Color contrast
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          WCAG 2.x contrast ratio for text and background (sRGB).
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
              Foreground (text)
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="color"
                value={pickerFg}
                onChange={(e) => setFg(e.target.value)}
                title="Pick foreground color"
                className="h-11 w-14 shrink-0 cursor-pointer rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 p-0.5"
              />
              <input
                type="text"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className="min-w-0 flex-1 p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em] mb-2">
              Background
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="color"
                value={pickerBg}
                onChange={(e) => setBg(e.target.value)}
                title="Pick background color"
                className="h-11 w-14 shrink-0 cursor-pointer rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 p-0.5"
              />
              <input
                type="text"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="min-w-0 flex-1 p-3 border border-stone-300 dark:border-stone-700 font-mono text-sm bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {err && (
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">{err}</p>
        )}

        {ratio != null && (
          <>
            <div
              className="p-6 rounded border border-stone-200 dark:border-stone-700 text-center"
              style={sampleStyle()}
            >
              <p className="text-lg font-medium">Sample heading text</p>
              <p className="text-sm mt-2 opacity-90">
                Body copy for contrast preview. The quick brown fox.
              </p>
            </div>

            <div className="font-mono text-sm space-y-2 p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700">
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {ratio}:1
              </p>
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr className="text-stone-500">
                    <th className="py-1">Level</th>
                    <th className="py-1">Normal text</th>
                    <th className="py-1">Large text (18pt+ / 14pt+ bold)</th>
                  </tr>
                </thead>
                <tbody className="text-stone-800 dark:text-stone-200">
                  <tr>
                    <td className="py-1">AA</td>
                    <td>{passesAA(ratio, false) ? "Pass" : "Fail"}</td>
                    <td>{passesAA(ratio, true) ? "Pass" : "Fail"}</td>
                  </tr>
                  <tr>
                    <td className="py-1">AAA</td>
                    <td>{passesAAA(ratio, false) ? "Pass" : "Fail"}</td>
                    <td>{passesAAA(ratio, true) ? "Pass" : "Fail"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
