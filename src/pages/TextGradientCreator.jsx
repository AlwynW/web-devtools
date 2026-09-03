import { useMemo, useState } from "react";
import { Plus } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";
import {
  clamp,
  DEFAULT_STOPS,
  gradientToCss,
} from "../utils/gradientCss";

const FONTS = [
  { label: "System UI", value: "system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Palatino", value: "Palatino, 'Palatino Linotype', serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
];

const WEIGHTS = [
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semibold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Black", value: 900 },
];

export default function TextGradientCreator({ onToast }) {
  const [text, setText] = useState("Gradient Text");
  const [font, setFont] = useState(FONTS[0].value);
  const [weight, setWeight] = useState(700);
  const [fontSize, setFontSize] = useState(72);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [radialShape, setRadialShape] = useState("ellipse");
  const [radialSize, setRadialSize] = useState("farthest-corner");
  const [radialPos, setRadialPos] = useState("center");
  const [stops, setStops] = useState(DEFAULT_STOPS);

  const gradient = useMemo(
    () =>
      gradientToCss({
        type,
        angle,
        radialShape,
        radialSize,
        radialPos,
        stops,
      }),
    [type, angle, radialShape, radialSize, radialPos, stops],
  );

  const previewStyle = {
    fontFamily: font,
    fontWeight: weight,
    fontSize: `${fontSize}px`,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: 1.15,
    backgroundImage: gradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };

  const cssOutput = `.gradient-text {
  font-family: ${font};
  font-weight: ${weight};
  font-size: ${fontSize}px;
  letter-spacing: ${letterSpacing}px;
  background-image: ${gradient};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}`;

  const addStop = () => {
    setStops((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          color: "#94a3b8",
          alpha: 100,
          pos: clamp((last?.pos ?? 50) + 10, 0, 100),
        },
      ];
    });
  };

  const updateStop = (index, field, value) => {
    setStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)),
    );
  };

  const removeStop = (index) => {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Text Gradient
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Clip a gradient to text with background-clip. System fonts only.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div
          className="min-h-40 flex items-center justify-center p-8 border border-stone-200 dark:border-stone-700 overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #e7e5e4 25%, transparent 25%), linear-gradient(-45deg, #e7e5e4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e7e5e4 75%), linear-gradient(-45deg, transparent 75%, #e7e5e4 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
            backgroundColor: "#fafaf9",
          }}
        >
          <p
            className="text-center break-words max-w-full m-0 dark:[filter:none]"
            style={{
              ...previewStyle,
            }}
          >
            {text || "Type something"}
          </p>
        </div>

        <div>
          <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
            Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Font
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Weight
            </label>
            <select
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm"
            >
              {WEIGHTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label} ({w.value})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
              <span>Size</span>
              <span>{fontSize}px</span>
            </label>
            <input
              type="range"
              min={16}
              max={160}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
              <span>Letter spacing</span>
              <span>{letterSpacing}px</span>
            </label>
            <input
              type="range"
              min={-4}
              max={24}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/40">
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 w-max text-xs font-mono">
            {["linear", "radial", "conic"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 ${
                  type === t
                    ? "bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200"
                    : "text-stone-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(type === "linear" || type === "conic") && (
            <div>
              <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
                <span>{type === "conic" ? "From angle" : "Angle"}</span>
                <span>{angle}deg</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
              />
            </div>
          )}

          {type === "radial" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={radialShape}
                onChange={(e) => setRadialShape(e.target.value)}
                className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm dark:text-white"
              >
                <option value="circle">circle</option>
                <option value="ellipse">ellipse</option>
              </select>
              <select
                value={radialSize}
                onChange={(e) => setRadialSize(e.target.value)}
                className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm dark:text-white"
              >
                <option value="closest-side">closest-side</option>
                <option value="closest-corner">closest-corner</option>
                <option value="farthest-side">farthest-side</option>
                <option value="farthest-corner">farthest-corner</option>
              </select>
              <select
                value={radialPos}
                onChange={(e) => setRadialPos(e.target.value)}
                className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm dark:text-white"
              >
                <option value="center">center</option>
                <option value="top">top</option>
                <option value="bottom">bottom</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                Color stops
              </p>
              <button
                type="button"
                onClick={addStop}
                className="text-xs font-mono text-stone-600 dark:text-stone-400 hover:underline"
              >
                + Add stop
              </button>
            </div>
            {stops.map((stop, stopIndex) => (
              <div
                key={`stop-${stopIndex}`}
                className="p-3 border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-950/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-stone-500">
                    Stop {stopIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStop(stopIndex)}
                    disabled={stops.length <= 2}
                    className="text-xs text-red-500 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(stopIndex, "color", e.target.value)}
                    className="w-10 h-8 border border-stone-200 dark:border-stone-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(stopIndex, "color", e.target.value)}
                    className="w-24 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-mono dark:text-white"
                  />
                  <label className="text-xs font-mono text-stone-500">Opacity</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.alpha}
                    onChange={(e) =>
                      updateStop(stopIndex, "alpha", Number.parseInt(e.target.value, 10))
                    }
                    className="w-28 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                  />
                  <span className="text-xs text-stone-500 w-8">{stop.alpha}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-stone-500">Position</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.pos}
                    onChange={(e) =>
                      updateStop(stopIndex, "pos", Number.parseInt(e.target.value, 10))
                    }
                    className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                  />
                  <span className="text-xs text-stone-500 w-8">{stop.pos}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={addStop} icon={Plus} variant="outline">
          Add color stop
        </Button>

        <CopyArea text={cssOutput} onCopySuccess={() => onToast("CSS copied!")} />
      </div>
    </div>
  );
}
