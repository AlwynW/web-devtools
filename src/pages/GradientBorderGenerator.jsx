import { useMemo, useState } from "react";
import CopyArea from "../components/CopyArea";
import {
  clamp,
  DEFAULT_STOPS,
  gradientToCss,
  hexToRgba,
} from "../utils/gradientCss";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

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

      <PageHeader title="Gradient Border" description="Masked ring on ::before — fill stays independently translucent." />

      <Panel className="space-y-6">
        <div
          className="min-h-48 flex items-center justify-center p-10 border border-border"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #d6d3d1 25%, transparent 25%), linear-gradient(-45deg, #d6d3d1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d6d3d1 75%), linear-gradient(-45deg, transparent 75%, #d6d3d1 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            backgroundColor: "#e7e5e4",
          }}
        >
          <div
            className="relative min-w-[220px] max-w-sm text-center font-mono text-sm text-fg"
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
            <label className="flex justify-between text-xs font-medium mb-1 text-fg-muted">
              <span>Border width</span>
              <span>{borderWidth}px</span>
            </label>
            <input
              type="range"
              min={1}
              max={24}
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full h-2 bg-secondary-hover accent-fg"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-fg-muted">
              <span>Border radius</span>
              <span>{borderRadius}px</span>
            </label>
            <input
              type="range"
              min={0}
              max={64}
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full h-2 bg-secondary-hover accent-fg"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-medium mb-1 text-fg-muted">
              <span>Content padding</span>
              <span>{previewPad}px</span>
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={previewPad}
              onChange={(e) => setPreviewPad(Number(e.target.value))}
              className="w-full h-2 bg-secondary-hover accent-fg"
            />
          </div>
          <div>
            <label className="block text-[11px] text-fg-muted uppercase tracking-[0.18em] mb-1">
              Fill color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-10 h-8 border border-border cursor-pointer"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-24 px-2 py-1 bg-shell border border-border text-xs font-mono dark:text-white"
              />
              <label className="text-xs font-mono text-fg-muted">Opacity</label>
              <input
                type="range"
                min={0}
                max={100}
                value={fillAlpha}
                onChange={(e) => setFillAlpha(Number(e.target.value))}
                className="w-28 h-2 bg-secondary-hover accent-fg"
              />
              <span className="text-xs text-fg-muted w-8">{fillAlpha}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 border border-border bg-surface-muted/60 dark:bg-overlay">
          <label className="flex items-center gap-2 text-sm font-mono text-fg-soft">
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="rounded border-border-muted text-fg focus:ring-focus"
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
              <label className="flex justify-between text-xs font-medium mb-1 text-fg-muted">
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
                className="w-full h-2 bg-secondary-hover accent-fg"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 border border-border bg-surface-muted/60 dark:bg-overlay">
          <p className="text-xs font-bold text-fg-muted">
            Border gradient
          </p>

          <div className="flex gap-2 p-1 bg-hover-muted w-max text-xs font-mono">
            {["linear", "radial", "conic"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 ${
                  type === t
                    ? "bg-surface-inset text-fg-soft"
                    : "text-fg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(type === "linear" || type === "conic") && (
            <div>
              <label className="flex justify-between text-xs font-medium mb-1 text-fg-muted">
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
                className="w-full h-2 bg-secondary-hover accent-fg"
              />
            </div>
          )}

          {type === "radial" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={radialShape}
                onChange={(e) => setRadialShape(e.target.value)}
                className="w-full p-2 bg-surface-muted border border-border text-sm dark:text-white"
              >
                <option value="circle">circle</option>
                <option value="ellipse">ellipse</option>
              </select>
              <select
                value={radialSize}
                onChange={(e) => setRadialSize(e.target.value)}
                className="w-full p-2 bg-surface-muted border border-border text-sm dark:text-white"
              >
                <option value="closest-side">closest-side</option>
                <option value="closest-corner">closest-corner</option>
                <option value="farthest-side">farthest-side</option>
                <option value="farthest-corner">farthest-corner</option>
              </select>
              <select
                value={radialPos}
                onChange={(e) => setRadialPos(e.target.value)}
                className="w-full p-2 bg-surface-muted border border-border text-sm dark:text-white"
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
              <p className="text-xs font-bold text-fg-muted">
                Color stops
              </p>
              <button
                type="button"
                onClick={addStop}
                className="text-xs font-mono text-fg-muted hover:underline"
              >
                + Add stop
              </button>
            </div>
            {stops.map((stop, stopIndex) => (
              <div
                key={`stop-${stopIndex}`}
                className="p-3 border border-border bg-surface-code/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-fg-muted">
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
                    className="w-10 h-8 border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(stopIndex, "color", e.target.value)}
                    className="w-24 px-2 py-1 bg-shell border border-border text-xs font-mono dark:text-white"
                  />
                  <label className="text-xs font-mono text-fg-muted">Opacity</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.alpha}
                    onChange={(e) =>
                      updateStop(stopIndex, "alpha", Number.parseInt(e.target.value, 10))
                    }
                    className="w-28 h-2 bg-secondary-hover accent-fg"
                  />
                  <span className="text-xs text-fg-muted w-8">{stop.alpha}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-fg-muted">Position</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.pos}
                    onChange={(e) =>
                      updateStop(stopIndex, "pos", Number.parseInt(e.target.value, 10))
                    }
                    className="flex-1 h-2 bg-secondary-hover accent-fg"
                  />
                  <span className="text-xs text-fg-muted w-8">{stop.pos}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-mono text-fg-muted leading-relaxed">
          Dual background-clip cannot punch a true hole — the gradient would show
          through a translucent fill. A masked ::before ring keeps the fill and
          border independent.
          {animating
            ? " Rotation uses @property --gb-angle so the gradient angle interpolates smoothly."
            : ""}
        </p>

        <CopyArea text={cssOutput} onCopySuccess={() => onToast("CSS copied!")} />
      </Panel>
    </div>
  );
}
