import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

/**
 * Adaptive harmony: linear R − P for small padding, then blend toward a
 * harmonic ratio so inner corners stay visually smooth when padding is large.
 */
function calculateInnerRadius(outerR, pad, adaptive) {
  const R = outerR;
  const P = pad;
  if (R === 0) return 0;
  if (!adaptive) return Math.max(R - P, 0);
  if (P === 0) return R;

  const physical = R - P;
  if (P <= R * 0.5) {
    return Math.max(physical, 0);
  }

  const ratio = R / (R + P);
  const harmonic = R * ratio;
  const weight = Math.min(Math.max((P - R * 0.5) / (R * 0.5), 0), 1);
  const result = physical * (1 - weight) + harmonic * weight;
  return Math.round(result);
}

function getHarmony(outerRadius, innerRadius, padding) {
  if (outerRadius === 0) return { label: "Flat", color: "stone", pct: 100 };
  if (padding === 0) return { label: "No gap", color: "stone", pct: 100 };

  const ratio = innerRadius / outerRadius;

  if (ratio >= 0.4)
    return { label: "Excellent", color: "emerald", pct: 100 };
  if (ratio >= 0.25) return { label: "Good", color: "emerald", pct: 75 };
  if (ratio >= 0.1) return { label: "Okay", color: "amber", pct: 50 };
  return { label: "Poor", color: "red", pct: 20 };
}

export default function PerfectBorderGenerator({ onToast }) {
  const [outerRadius, setOuterRadius] = useState(24);
  const [padding, setPadding] = useState(8);
  const [copyMode, setCopyMode] = useState("separate");
  const [adaptiveHarmony, setAdaptiveHarmony] = useState(false);

  const geometricInner = Math.max(outerRadius - padding, 0);
  const innerRadius = useMemo(
    () => calculateInnerRadius(outerRadius, padding, adaptiveHarmony),
    [outerRadius, padding, adaptiveHarmony],
  );

  const methodLabel = !adaptiveHarmony
    ? "Classic"
    : outerRadius === 0 || padding === 0 || padding <= outerRadius * 0.5
      ? "Geometric"
      : "Adaptive";

  const harmony = getHarmony(outerRadius, innerRadius, padding);
  const maxRecommendedPadding = Math.floor(outerRadius * 0.6);

  // Preview scales so the inner content never collapses
  const previewInnerSize = { w: 180, h: 120 };
  const scaleFactor = padding > 32 ? 32 / padding : 1;
  const vPadding = Math.round(padding * scaleFactor);
  const vOuterRadius = Math.round(outerRadius * scaleFactor);
  const vInnerRadius = Math.round(innerRadius * scaleFactor);

  const cssSnippet = adaptiveHarmony
    ? `.outer {
  --outer-radius: ${outerRadius}px;
  --padding: ${padding}px;
  /* adaptive harmony (large padding blends toward R/(R+P)) */
  --inner-radius: ${innerRadius}px;

  border-radius: var(--outer-radius);
  padding: var(--padding);
}

.inner {
  border-radius: var(--inner-radius);
}`
    : `.outer {
  --outer-radius: ${outerRadius}px;
  --padding: ${padding}px;
  --inner-radius: calc(var(--outer-radius) - var(--padding));

  border-radius: var(--outer-radius);
  padding: var(--padding);
}

.inner {
  border-radius: var(--inner-radius);
}`;

  const htmlSnippet = `<div class="outer">
  <div class="inner">
    <!-- content -->
  </div>
</div>`;

  const inlineSnippet = adaptiveHarmony
    ? `<div
  class="outer"
  style="
    --outer-radius: ${outerRadius}px;
    --padding: ${padding}px;
    --inner-radius: ${innerRadius}px;
  "
>
  <div class="inner">
    <!-- content -->
  </div>
</div>`
    : `<div
  class="outer"
  style="
    --outer-radius: ${outerRadius}px;
    --padding: ${padding}px;
    --inner-radius: calc(var(--outer-radius) - var(--padding));
  "
>
  <div class="inner">
    <!-- content -->
  </div>
</div>`;

  const tailwindSnippet = `<div class="rounded-[${outerRadius}px] p-[${padding}px]">
  <div class="rounded-[${innerRadius}px]">
    <!-- content -->
  </div>
</div>`;

  const copyModes = [
    { key: "separate", label: "CSS + HTML" },
    { key: "inline", label: "Inline vars" },
    { key: "tailwind", label: "Tailwind v4" },
  ];

  const harmonySwatch = useMemo(() => {
    const map = {
      emerald: "bg-emerald-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
      stone: "bg-stone-400",
    };
    return map[harmony.color] ?? "bg-stone-400";
  }, [harmony.color]);

  const harmonyTextColor = useMemo(() => {
    const map = {
      emerald: "text-emerald-600 dark:text-emerald-400",
      amber: "text-amber-600 dark:text-amber-400",
      red: "text-red-600 dark:text-red-400",
      stone: "text-stone-500 dark:text-stone-400",
    };
    return map[harmony.color] ?? "text-stone-500";
  }, [harmony.color]);

  const harmonyBarColor = useMemo(() => {
    const map = {
      emerald: "bg-emerald-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
      stone: "bg-stone-400",
    };
    return map[harmony.color] ?? "bg-stone-400";
  }, [harmony.color]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Perfect Border Radius
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Generate matching outer/inner radii so borders stay perfectly
          smooth.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 items-start">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-[11px] font-mono mb-1 text-stone-500 dark:text-stone-400">
                <span>Outer radius</span>
                <span className="text-stone-900 dark:text-stone-100">
                  {outerRadius}px
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={outerRadius}
                  onChange={(e) =>
                    setOuterRadius(parseInt(e.target.value) || 0)
                  }
                  className="w-full h-2 bg-stone-200 dark:bg-stone-700 appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200"
                />
                <input
                  type="number"
                  min={0}
                  max={256}
                  value={outerRadius}
                  onChange={(e) =>
                    setOuterRadius(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="w-20 px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="flex justify-between text-[11px] font-mono mb-1 text-stone-500 dark:text-stone-400">
                <span>Padding</span>
                <span className="text-stone-900 dark:text-stone-100">
                  {padding}px
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={48}
                  value={padding}
                  onChange={(e) =>
                    setPadding(parseInt(e.target.value) || 0)
                  }
                  className="w-full h-2 bg-stone-200 dark:bg-stone-700 appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200"
                />
                <input
                  type="number"
                  min={0}
                  max={256}
                  value={padding}
                  onChange={(e) =>
                    setPadding(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="w-20 px-2 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Adaptive harmony switch */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="min-w-0 space-y-0.5">
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block">
                  Adaptive harmony
                </span>
                <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 leading-snug">
                  Off: classic{" "}
                  <span className="whitespace-nowrap">max(R − P, 0)</span>. On:
                  smooth blend when padding is large.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={adaptiveHarmony}
                aria-label="Enable adaptive harmony algorithm"
                onClick={() => setAdaptiveHarmony((v) => !v)}
                className={`relative shrink-0 w-11 h-6 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 dark:focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900 ${
                  adaptiveHarmony
                    ? "bg-stone-800 dark:bg-stone-200 border-stone-700 dark:border-stone-300"
                    : "bg-stone-200 dark:bg-stone-700 border-stone-300 dark:border-stone-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-[calc(100%-4px)] aspect-square rounded-full bg-white dark:bg-stone-900 shadow-sm transition-transform ${
                    adaptiveHarmony ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Computed inner radius */}
            <div className="text-sm font-mono text-stone-500 dark:text-stone-400 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span className="font-semibold text-stone-700 dark:text-stone-200">
                  Inner radius:
                </span>
                {!adaptiveHarmony ? (
                  <span>
                    max({outerRadius} − {padding}, 0) ={" "}
                    <span className="text-stone-900 dark:text-stone-100">
                      {innerRadius}px
                    </span>
                  </span>
                ) : methodLabel === "Adaptive" ? (
                  <span>
                    blended (harmonic curve) →{" "}
                    <span className="text-stone-900 dark:text-stone-100">
                      {innerRadius}px
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">
                      {" "}
                      (pure subtract would be {geometricInner}px)
                    </span>
                  </span>
                ) : (
                  <span>
                    max({outerRadius} − {padding}, 0) ={" "}
                    <span className="text-stone-900 dark:text-stone-100">
                      {innerRadius}px
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">
                      {" "}
                      — geometric for this scale
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Harmony indicator */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Harmony
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold ${harmonyTextColor}`}
                >
                  {harmony.label}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                <span>Method</span>
                <span className="text-stone-800 dark:text-stone-200 font-semibold">
                  {methodLabel}
                </span>
              </div>
              <div className="h-1.5 bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${harmonyBarColor}`}
                  style={{ width: `${harmony.pct}%` }}
                />
              </div>
              {adaptiveHarmony && methodLabel === "Adaptive" && (
                <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 leading-relaxed">
                  Inner radius is smoothed so the corner does not look too sharp
                  relative to the gap; copy CSS uses the computed{" "}
                  {innerRadius}px value.
                </p>
              )}
              {!adaptiveHarmony && harmony.pct <= 50 && (
                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  Tip: keep padding ≤{" "}
                  {maxRecommendedPadding}px (≈60% of outer
                  radius) for smooth-looking inner corners, or enable adaptive
                  harmony.
                </p>
              )}
              {innerRadius === 0 && padding > 0 && outerRadius > 0 && (
                <p className="text-[11px] font-mono text-red-600 dark:text-red-400">
                  Inner radius clamped to 0 — the inner
                  element will have sharp corners.
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="text-sm font-mono text-stone-600 dark:text-stone-300">
              Live preview
              {scaleFactor < 1 && (
                <span className="ml-2 text-[10px] text-stone-400">
                  (scaled to fit)
                </span>
              )}
            </div>
            <div className="p-6 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
              <div
                className="bg-gradient-to-br from-stone-500 to-stone-600 flex items-center justify-center transition-all duration-150"
                style={{
                  width: previewInnerSize.w + vPadding * 2,
                  height: previewInnerSize.h + vPadding * 2,
                  borderRadius: `${vOuterRadius}px`,
                  padding: `${vPadding}px`,
                }}
              >
                <div
                  className="w-full h-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center transition-all duration-150"
                  style={{
                    borderRadius: `${vInnerRadius}px`,
                  }}
                >
                  <span className="text-xs font-mono text-stone-500 dark:text-stone-400 text-center px-2">
                    inner = {innerRadius}px
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code output */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-semibold text-stone-700 dark:text-stone-200">
                Copy mode
              </h3>
            </div>
            <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
              {copyModes.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setCopyMode(m.key)}
                  className={`px-3 py-1.5 transition-colors ${
                    copyMode === m.key
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                      : "text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {copyMode === "separate" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-mono font-semibold text-stone-700 dark:text-stone-200">
                    CSS
                  </h4>
                 
                </div>
                <CopyArea
                  text={cssSnippet}
                  onCopySuccess={() => onToast?.("CSS copied!")}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-mono font-semibold text-stone-700 dark:text-stone-200">
                    HTML
                  </h4>
                 
                </div>
                <CopyArea
                  text={htmlSnippet}
                  onCopySuccess={() =>
                    onToast?.("HTML copied!")
                  }
                />
              </div>
            </div>
          )}

          {copyMode === "inline" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-mono font-semibold text-stone-700 dark:text-stone-200">
                  HTML with inline CSS variables
                </h4>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(inlineSnippet);
                    onToast?.("Snippet copied!");
                  }}
                  className="text-xs py-1 px-3"
                >
                  Copy snippet
                </Button>
              </div>
              <CopyArea
                text={inlineSnippet}
                onCopySuccess={() =>
                  onToast?.("Snippet copied!")
                }
              />
            </div>
          )}

          {copyMode === "tailwind" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-mono font-semibold text-stone-700 dark:text-stone-200">
                  Tailwind v4
                </h4>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      tailwindSnippet,
                    );
                    onToast?.("Tailwind snippet copied!");
                  }}
                  className="text-xs py-1 px-3"
                >
                  Copy snippet
                </Button>
              </div>
              <CopyArea
                text={tailwindSnippet}
                onCopySuccess={() =>
                  onToast?.("Tailwind snippet copied!")
                }
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}