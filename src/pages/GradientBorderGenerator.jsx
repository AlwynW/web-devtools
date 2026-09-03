import { useMemo, useState } from "react";
import CopyArea from "../components/CopyArea";
import {
  clamp,
  DEFAULT_STOPS,
  gradientToCss,
  hexToRgba,
} from "../utils/gradientCss";

/**
 * Gradient border via a masked ::before ring so the element's own
 * background can be translucent and still show whatever is behind it.
 */
export default function GradientBorderGenerator({ onToast }) {
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderRadius, setBorderRadius] = useState(16);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [fillAlpha, setFillAlpha] = useState(40);
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState("ellipse");
  const [radialSize, setRadialSize] = useState("farthest-corner");
  const [radialPos, setRadialPos] = useState("center");
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const [previewPad, setPreviewPad] = useState(24);
  const [animate, setAnimate] = useState(false);
  const [duration, setDuration] = useState(4);

  const canAnimate = type === "linear" || type === "conic";
  const animating = animate && canAnimate;

  const gradient = useMemo(
    () =>
      gradientToCss({
        type,
        angle,
        angleExpr: animating ? "var(--gb-angle)" : undefined,
        radialShape,
        radialSize,
        radialPos,
        stops,
      }),
    [type, angle, animating, radialShape, radialSize, radialPos, stops],
  );

  const fillCss = hexToRgba(fillColor, fillAlpha);
  const endAngle = angle + 360;

  const cssOutput = useMemo(() => {
    const beforeRules = [
      "  content: \"\";",
      "  position: absolute;",
      "  inset: 0;",
      "  border-radius: inherit;",
      `  padding: ${borderWidth}px;`,
      `  background: ${gradient};`,
      "  pointer-events: none;",
      "  -webkit-mask:",
      "    linear-gradient(#fff 0 0) content-box,",
      "    linear-gradient(#fff 0 0);",
      "  -webkit-mask-composite: xor;",
      "          mask-composite: exclude;",
    ];

    if (animating) {
      beforeRules.splice(
        5,
        0,
        `  --gb-angle: ${angle}deg;`,
        `  animation: gb-rotate ${duration}s linear infinite;`,
      );
    }

    const parts = [];

    if (animating) {
      parts.push(`@property --gb-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes gb-rotate {
  to {
    --gb-angle: ${endAngle}deg;
  }
}
`);
    }

    parts.push(`.gradient-border {
  position: relative;
  border-radius: ${borderRadius}px;
  background: ${fillCss};
  /* padding is content inset — border lives on ::before */
  padding: ${previewPad}px;
}

.gradient-border::before {
${beforeRules.join("\n")}
}`);

    return parts.join("\n");
  }, [
    animating,
    angle,
    borderRadius,
    borderWidth,
    duration,
    endAngle,
    fillCss,
    gradient,
    previewPad,
  ]);

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
      {animating && (
        <style>{`
          @property --gb-angle {
            syntax: "<angle>";
            inherits: false;
            initial-value: 0deg;
          }
          @keyframes gb-border-preview-spin {
            to { --gb-angle: ${endAngle}deg; }
          }
        `}</style>
      )}

      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Gradient Border
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Masked ring on ::before — fill stays independently translucent.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div
          className="min-h-48 flex items-center justify-center p-10 border border-stone-200 dark:border-stone-700"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #d6d3d1 25%, transparent 25%), linear-gradient(-45deg, #d6d3d1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d6d3d1 75%), linear-gradient(-45deg, transparent 75%, #d6d3d1 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            backgroundColor: "#e7e5e4",
          }}
        >
          <div
            className="relative min-w-[220px] max-w-sm text-center font-mono text-sm text-stone-800 dark:text-stone-100"
            style={{
              borderRadius: `${borderRadius}px`,
              background: fillCss,
              padding: `${previewPad}px`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: "inherit",
                padding: `${borderWidth}px`,
                backgroundImage: gradient,
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                ...(animating
                  ? {
                      ["--gb-angle"]: `${angle}deg`,
                      animation: `gb-border-preview-spin ${duration}s linear infinite`,
                    }
                  : {}),
              }}
            />
            <p className="relative m-0 leading-relaxed">
              Checkerboard shows through when fill opacity is below 100%.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
              <span>Border width</span>
              <span>{borderWidth}px</span>
            </label>
            <input
              type="range"
              min={1}
              max={24}
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
              <span>Border radius</span>
              <span>{borderRadius}px</span>
            </label>
            <input
              type="range"
              min={0}
              max={64}
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
              <span>Content padding</span>
              <span>{previewPad}px</span>
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={previewPad}
              onChange={(e) => setPreviewPad(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 uppercase tracking-[0.18em] mb-1">
              Fill color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-10 h-8 border border-stone-200 dark:border-stone-600 cursor-pointer"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-24 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-mono dark:text-white"
              />
              <label className="text-xs font-mono text-stone-500">Opacity</label>
              <input
                type="range"
                min={0}
                max={100}
                value={fillAlpha}
                onChange={(e) => setFillAlpha(Number(e.target.value))}
                className="w-28 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
              />
              <span className="text-xs text-stone-500 w-8">{fillAlpha}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/40">
          <label className="flex items-center gap-2 text-sm font-mono text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="rounded border-stone-400 text-stone-900 focus:ring-stone-500"
            />
            Animate rotation
          </label>
          {animate && !canAnimate && (
            <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
              Rotation needs a linear or conic gradient — switch type above.
            </p>
          )}
          {animating && (
            <div>
              <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
                <span>Duration</span>
                <span>{duration}s</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/40">
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
            Border gradient
          </p>

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
                <span>
                  {animating
                    ? "Start angle"
                    : type === "conic"
                      ? "From angle"
                      : "Angle"}
                </span>
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

        <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 leading-relaxed">
          Dual background-clip cannot punch a true hole — the gradient would show
          through a translucent fill. A masked ::before ring keeps the fill and
          border independent.
          {animating
            ? " Rotation uses @property --gb-angle so the gradient angle interpolates smoothly."
            : ""}
        </p>

        <CopyArea text={cssOutput} onCopySuccess={() => onToast("CSS copied!")} />
      </div>
    </div>
  );
}
