import { useState, useEffect, useCallback } from "react";
import {
  formatHex,
  formatRgb,
  formatHsl,
  formatCss,
  parse,
  oklch,
} from "culori";
import CopyButton from "../components/CopyButton";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

const detectFormat = (str) => {
  const s = str.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(s))
    return "hex";
  if (/^rgb\(|^rgba\(/.test(s)) return "rgb";
  if (/^hsl\(|^hsla\(/.test(s)) return "hsl";
  if (/^oklch\(/.test(s)) return "oklch";
  if (/^[0-9a-fA-F]{6}$/.test(s)) return "hex";
  return null;
};

export default function ColorConverter({ onToast }) {
  const [input, setInput] = useState("#3b82f6");
  const [error, setError] = useState(null);
  const [formats, setFormats] = useState({
    hex: "",
    rgb: "",
    hsl: "",
    oklch: "",
  });
  const [previewColor, setPreviewColor] = useState("#3b82f6");

  const convert = useCallback(() => {
    setError(null);
    const s = input.trim();
    if (!s) {
      setFormats({ hex: "", rgb: "", hsl: "", oklch: "" });
      return;
    }

    const format = detectFormat(s);
    const parsed = format ? parse(s) : parse("#" + s);

    if (!parsed) {
      setError("Could not parse color. Try hex (#fff), rgb(), hsl(), or oklch().");
      setFormats({ hex: "", rgb: "", hsl: "", oklch: "" });
      return;
    }

    try {
      const hex = formatHex(parsed);
      setPreviewColor(hex);
      const oklchColor = oklch(parsed);
      setFormats({
        hex: formatHex(parsed),
        rgb: formatRgb(parsed),
        hsl: formatHsl(parsed),
        oklch: oklchColor ? formatCss(oklchColor) : "",
      });
    } catch (e) {
      setError(e.message || "Conversion failed");
      setFormats({ hex: "", rgb: "", hsl: "", oklch: "" });
    }
  }, [input]);

  useEffect(() => {
    convert();
  }, [convert]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Color Converter" description="Convert between hex, RGB, HSL, and OKLCH." />

      <Panel className="space-y-4">
        <Label>
          Input color (hex, rgb, hsl, oklch)
        </Label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#3b82f6 or rgb(59, 130, 246) or oklch(0.6 0.2 250)"
          className="w-full p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
        />

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {formats.hex && (
          <>
            <div className="flex items-center gap-4">
              <label
                className="w-24 h-24 border-2 border-border rounded-control shrink-0 cursor-pointer overflow-hidden block"
                style={{ backgroundColor: previewColor }}
                title="Click to pick a color"
              >
                <input
                  type="color"
                  value={previewColor.length === 7 ? previewColor : previewColor.slice(0, 7)}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <div className="text-sm font-mono text-fg-muted">
                Click swatch to open color picker
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { key: "hex", label: "HEX" },
                { key: "rgb", label: "RGB" },
                { key: "hsl", label: "HSL" },
                { key: "oklch", label: "OKLCH" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-surface-muted border border-border rounded-control"
                >
                  <span className="text-sm font-mono text-fg-muted">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-fg-soft">
                      {formats[key]}
                    </code>
                    <CopyButton
                      text={formats[key]}
                      onCopySuccess={() => onToast(`${label} copied!`)}
                      title={`Copy ${label}`}
                      size={16}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
