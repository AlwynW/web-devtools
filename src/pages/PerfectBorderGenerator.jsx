import { useState } from "react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

export default function PerfectBorderGenerator({ onToast }) {
  const [outerRadius, setOuterRadius] = useState(24);
  const [padding, setPadding] = useState(8);
  const [copyMode, setCopyMode] = useState("separate");

  const innerRadius = Math.max(outerRadius - padding, 0);

  const cssSnippet = `.outer {
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

  const inlineSnippet = `<div
  class="outer"
  style="--outer-radius: ${outerRadius}px; --padding: ${padding}px; --inner-radius: calc(var(--outer-radius) - var(--padding));"
>
  <div class="inner">
    <!-- content -->
  </div>
</div>`;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Perfect Border Radius
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Generate matching outer/inner radii so borders stay perfectly smooth.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 items-start">
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm font-medium mb-1 dark:text-slate-300">
                <span>Outer radius</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {outerRadius}px
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={outerRadius}
                  onChange={(e) => setOuterRadius(parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
                <input
                  type="number"
                  min={0}
                  max={256}
                  value={outerRadius}
                  onChange={(e) =>
                    setOuterRadius(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium mb-1 dark:text-slate-300">
                <span>Padding</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {padding}px
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={48}
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
                <input
                  type="number"
                  min={0}
                  max={256}
                  value={padding}
                  onChange={(e) =>
                    setPadding(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono dark:text-white"
                />
              </div>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Inner radius:
                </span>
                <span className="font-mono">
                  max({outerRadius}px - {padding}px, 0) ={" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {innerRadius}px
                  </span>
                </span>
              </div>
              {innerRadius === 0 && padding > outerRadius && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Padding is larger than the outer radius, so the inner radius is clamped to 0.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Live preview
            </div>
            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <div
                className="w-56 h-40 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"
                style={{
                  borderRadius: `${outerRadius}px`,
                  padding: `${padding}px`,
                }}
              >
                <div
                  className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm"
                  style={{ borderRadius: `${innerRadius}px` }}
                >
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Smooth inner corner = {innerRadius}px
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Copy mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose whether you want separate CSS/HTML or a single HTML block with inline CSS variables.
              </p>
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setCopyMode("separate")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  copyMode === "separate"
                    ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                CSS + HTML
              </button>
              <button
                type="button"
                onClick={() => setCopyMode("inline")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  copyMode === "inline"
                    ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                HTML with inline vars
              </button>
            </div>
          </div>

          {copyMode === "separate" ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    CSS
                  </h4>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(cssSnippet);
                      onToast?.("CSS copied!");
                    }}
                    className="text-xs py-1 px-3"
                  >
                    Copy CSS
                  </Button>
                </div>
                <CopyArea
                  text={cssSnippet}
                  onCopySuccess={() => onToast?.("CSS copied!")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    HTML
                  </h4>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(htmlSnippet);
                      onToast?.("HTML copied!");
                    }}
                    className="text-xs py-1 px-3"
                  >
                    Copy HTML
                  </Button>
                </div>
                <CopyArea
                  text={htmlSnippet}
                  onCopySuccess={() => onToast?.("HTML copied!")}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  HTML with inline CSS variables
                </h4>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(inlineSnippet);
                    onToast?.("HTML snippet copied!");
                  }}
                  className="text-xs py-1 px-3"
                >
                  Copy snippet
                </Button>
              </div>
              <CopyArea
                text={inlineSnippet}
                onCopySuccess={() => onToast?.("HTML snippet copied!")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

