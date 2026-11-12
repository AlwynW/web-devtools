import { useMemo, useState, useCallback } from "react";
import { parse, formatRgb, formatHex, converter } from "culori";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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
      <PageHeader title="Color contrast" description="WCAG 2.x contrast ratio for text and background (sRGB)." />

      <Panel className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label mb-2">
              Foreground (text)
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="color"
                value={pickerFg}
                onChange={(e) => setFg(e.target.value)}
                title="Pick foreground color"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-control border border-border-strong bg-hover-muted p-0.5"
              />
              <input
                type="text"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className="min-w-0 flex-1 p-3 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
              />
            </div>
          </div>
          <div>
            <label className="field-label mb-2">
              Background
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="color"
                value={pickerBg}
                onChange={(e) => setBg(e.target.value)}
                title="Pick background color"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-control border border-border-strong bg-hover-muted p-0.5"
              />
              <input
                type="text"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="min-w-0 flex-1 p-3 border border-border-strong rounded-control font-mono text-sm bg-surface text-fg"
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
              className="p-6 rounded-control border border-border text-center"
              style={sampleStyle()}
            >
              <p className="text-lg font-medium">Sample heading text</p>
              <p className="text-sm mt-2 opacity-90">
                Body copy for contrast preview. The quick brown fox.
              </p>
            </div>

            <div className="font-mono text-sm space-y-2 p-4 bg-surface-code border border-border rounded-control">
              <p className="text-2xl font-bold text-fg">
                {ratio}:1
              </p>
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr className="text-fg-muted">
                    <th className="py-1">Level</th>
                    <th className="py-1">Normal text</th>
                    <th className="py-1">Large text (18pt+ / 14pt+ bold)</th>
                  </tr>
                </thead>
                <tbody className="text-fg-soft">
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
      </Panel>
    </div>
  );
}
