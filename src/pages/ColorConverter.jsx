import { useState, useEffect, useCallback } from "react";
import {
  formatHex,
  formatRgb,
  formatHsl,
  formatCss,
  parse,
  oklch,
} from "culori";
import { copyToClipboard } from "../utils/clipboard";

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

  const copy = (text, msg) =>
    copyToClipboard(text, () => onToast(msg || "Copied!"));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Color Converter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Convert between hex, RGB, HSL, and OKLCH.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Input color (hex, rgb, hsl, oklch)
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#3b82f6 or rgb(59, 130, 246) or oklch(0.6 0.2 250)"
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {formats.hex && (
          <>
            <div className="flex items-center gap-4">
              <label
                className="w-24 h-24 rounded-xl border-2 border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer overflow-hidden block"
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
              <div className="text-sm text-slate-500 dark:text-slate-400">
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
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm dark:text-slate-200">
                      {formats[key]}
                    </code>
                    <button
                      onClick={() => copy(formats[key], `${label} copied!`)}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      title="Copy"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
