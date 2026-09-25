import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Plus, Trash } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

const DEFAULT_LAYER = () => ({
  type: "linear",
  angle: 120,
  offsetX: 50,
  offsetY: 50,
  radialShape: "ellipse",
  radialSize: "farthest-corner",
  stops: [
    { color: "#3b82f6", alpha: 100, pos: 0 },
    { color: "#8b5cf6", alpha: 100, pos: 100 },
  ],
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split("")
        .map((c) => c + c)
        .join("")
    : normalized.padEnd(6, "0").slice(0, 6);

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const a = clamp(alpha, 0, 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function stopToCss(stop) {
  return `${hexToRgba(stop.color, stop.alpha)} ${stop.pos}%`;
}

function linearOffsetShift(angle, offsetX, offsetY) {
  const rad = ((angle % 360) * Math.PI) / 180;
  const dirX = Math.sin(rad);
  const dirY = -Math.cos(rad);
  const dx = offsetX - 50;
  const dy = offsetY - 50;
  return Math.round((dx * dirX + dy * dirY) * 2);
}

function layerToCss(layer) {
  const offsetX = layer.offsetX ?? 50;
  const offsetY = layer.offsetY ?? 50;
  if (layer.type === "radial") {
    return `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${offsetX}% ${offsetY}%, ${layer.stops
      .map(stopToCss)
      .join(", ")})`;
  }
  const shift = linearOffsetShift(layer.angle, offsetX, offsetY);
  const stops = layer.stops
    .map((stop) => `${hexToRgba(stop.color, stop.alpha)} ${stop.pos + shift}%`)
    .join(", ");
  return `linear-gradient(${layer.angle}deg, ${stops})`;
}

const PREVIEW_MODES = [
  { id: "strip", label: "Current" },
  { id: "square", label: "Square" },
  { id: "wide", label: "16:9" },
  { id: "page", label: "Page" },
];

const PREVIEW_FRAME = {
  strip: "w-full h-28",
  square: "w-full aspect-square",
  wide: "w-full aspect-video",
};

export default function GradientBuilder({ onToast }) {
  const [layers, setLayers] = useState([DEFAULT_LAYER()]);
  const [applyToPage, setApplyToPage] = useState(false);
  const [previewMode, setPreviewMode] = useState("strip");

  const backgroundImage = useMemo(
    () => layers.map(layerToCss).reverse().join(", "),
    [layers],
  );

  const cssOutput = `background-image: ${backgroundImage};`;

  const pagePreview = previewMode === "page";

  useEffect(() => {
    const root = document.documentElement;
    if (applyToPage || pagePreview) {
      root.style.setProperty("--live-page-gradient", backgroundImage);
      root.dataset.livePageGradient = "on";
    } else {
      root.style.removeProperty("--live-page-gradient");
      delete root.dataset.livePageGradient;
    }
    return () => {
      root.style.removeProperty("--live-page-gradient");
      delete root.dataset.livePageGradient;
    };
  }, [applyToPage, pagePreview, backgroundImage]);

  const addLayer = () => setLayers((prev) => [...prev, DEFAULT_LAYER()]);

  const removeLayer = (index) => {
    setLayers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveLayer = (index, direction) => {
    setLayers((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateLayer = (index, field, value) => {
    setLayers((prev) =>
      prev.map((layer, i) => (i === index ? { ...layer, [field]: value } : layer)),
    );
  };

  const addStop = (layerIndex) => {
    setLayers((prev) =>
      prev.map((layer, i) => {
        if (i !== layerIndex) return layer;
        const last = layer.stops[layer.stops.length - 1];
        return {
          ...layer,
          stops: [
            ...layer.stops,
            {
              color: "#94a3b8",
              alpha: 100,
              pos: clamp((last?.pos ?? 50) + 10, 0, 100),
            },
          ],
        };
      }),
    );
  };

  const updateStop = (layerIndex, stopIndex, field, value) => {
    setLayers((prev) =>
      prev.map((layer, i) => {
        if (i !== layerIndex) return layer;
        const stops = layer.stops.map((stop, j) =>
          j === stopIndex ? { ...stop, [field]: value } : stop,
        );
        return { ...layer, stops };
      }),
    );
  };

  const removeStop = (layerIndex, stopIndex) => {
    setLayers((prev) =>
      prev.map((layer, i) => {
        if (i !== layerIndex || layer.stops.length <= 2) return layer;
        return { ...layer, stops: layer.stops.filter((_, j) => j !== stopIndex) };
      }),
    );
  };

  const previewModeSwitch = (
    <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-stone-800 w-max text-xs font-mono">
      {PREVIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => setPreviewMode(mode.id)}
          className={`px-3 py-1.5 ${
            previewMode === mode.id
              ? "bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200"
              : "text-stone-500"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );

  const controls = (
    <>
      {!pagePreview && (
        <label className="flex items-center gap-2 text-sm font-mono text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            checked={applyToPage}
            onChange={(e) => setApplyToPage(e.target.checked)}
            className="rounded border-stone-400 text-stone-900 focus:ring-stone-500"
          />
          Apply gradient to page background (live)
        </label>
      )}

        <div className="space-y-4">
          {layers.map((layer, layerIndex) => (
            <div
              key={`layer-${layerIndex}`}
              className="p-4 border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/40 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
                  Layer {layerIndex + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLayer(layerIndex, -1)}
                    disabled={layerIndex === 0}
                    className="p-1.5 border border-stone-300 dark:border-stone-700 disabled:opacity-40"
                    title="Move up"
                  >
                    <ArrowUp size={14} weight="thin" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLayer(layerIndex, 1)}
                    disabled={layerIndex === layers.length - 1}
                    className="p-1.5 border border-stone-300 dark:border-stone-700 disabled:opacity-40"
                    title="Move down"
                  >
                    <ArrowDown size={14} weight="thin" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLayer(layerIndex)}
                    disabled={layers.length <= 1}
                    className="p-1.5 border border-stone-300 dark:border-stone-700 disabled:opacity-40"
                    title="Delete layer"
                  >
                    <Trash size={14} weight="thin" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 w-max text-xs font-mono">
                {["linear", "radial"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateLayer(layerIndex, "type", type)}
                    className={`px-3 py-1.5 ${
                      layer.type === type
                        ? "bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200"
                        : "text-stone-500"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {layer.type === "linear" && (
                <div>
                  <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
                    <span>Angle</span>
                    <span>{layer.angle}deg</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={layer.angle}
                    onChange={(e) => updateLayer(layerIndex, "angle", Number.parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                  />
                </div>
              )}

              {layer.type === "radial" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={layer.radialShape}
                    onChange={(e) => updateLayer(layerIndex, "radialShape", e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm dark:text-white"
                  >
                    <option value="circle">circle</option>
                    <option value="ellipse">ellipse</option>
                  </select>
                  <select
                    value={layer.radialSize}
                    onChange={(e) => updateLayer(layerIndex, "radialSize", e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm dark:text-white"
                  >
                    <option value="closest-side">closest-side</option>
                    <option value="closest-corner">closest-corner</option>
                    <option value="farthest-side">farthest-side</option>
                    <option value="farthest-corner">farthest-corner</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["offsetX", "Offset X"],
                  ["offsetY", "Offset Y"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
                      <span>{label}</span>
                      <span className="font-mono">−100–200%</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={-100}
                        max={200}
                        value={layer[field]}
                        onChange={(e) =>
                          updateLayer(layerIndex, field, Number.parseInt(e.target.value, 10))
                        }
                        className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                      />
                      <input
                        type="number"
                        min={-100}
                        max={200}
                        value={layer[field]}
                        onChange={(e) =>
                          updateLayer(
                            layerIndex,
                            field,
                            clamp(Number.parseInt(e.target.value || "0", 10), -100, 200),
                          )
                        }
                        className="w-16 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs dark:text-white"
                      />
                      <span className="text-xs text-stone-500">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-stone-500 dark:text-stone-400">Color stops</p>
                  <button
                    type="button"
                    onClick={() => addStop(layerIndex)}
                    className="text-xs font-mono text-stone-600 dark:text-stone-400 hover:underline"
                  >
                    + Add stop
                  </button>
                </div>
                {layer.stops.map((stop, stopIndex) => (
                  <div
                    key={`stop-${stopIndex}`}
                    className="p-3 border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-950/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-500">Stop {stopIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeStop(layerIndex, stopIndex)}
                        disabled={layer.stops.length <= 2}
                        className="text-xs text-red-500 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateStop(layerIndex, stopIndex, "color", e.target.value)}
                        className="w-10 h-8 border border-stone-200 dark:border-stone-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => updateStop(layerIndex, stopIndex, "color", e.target.value)}
                        className="w-24 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-mono dark:text-white"
                      />
                      <label className="text-xs font-mono text-stone-500">Opacity</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.alpha}
                        onChange={(e) =>
                          updateStop(layerIndex, stopIndex, "alpha", Number.parseInt(e.target.value, 10))
                        }
                        className="w-28 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.alpha}
                        onChange={(e) =>
                          updateStop(
                            layerIndex,
                            stopIndex,
                            "alpha",
                            clamp(Number.parseInt(e.target.value || "0", 10), 0, 100),
                          )
                        }
                        className="w-14 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs dark:text-white"
                      />
                      <span className="text-xs text-stone-500">%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-mono text-stone-500">Position</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.pos}
                        onChange={(e) =>
                          updateStop(layerIndex, stopIndex, "pos", Number.parseInt(e.target.value, 10))
                        }
                        className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 accent-stone-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.pos}
                        onChange={(e) =>
                          updateStop(
                            layerIndex,
                            stopIndex,
                            "pos",
                            clamp(Number.parseInt(e.target.value || "0", 10), 0, 100),
                          )
                        }
                        className="w-14 px-2 py-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs dark:text-white"
                      />
                      <span className="text-xs text-stone-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={addLayer} icon={Plus} variant="outline">
          Add gradient layer
        </Button>

        <CopyArea text={cssOutput} onCopySuccess={() => onToast("CSS copied!")} />
    </>
  );

  if (pagePreview) {
    return createPortal(
      <aside className="fixed top-16 right-0 bottom-0 z-20 w-[min(100vw-2.5rem,24rem)] overflow-y-auto border-l border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 p-4 space-y-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-50">
            Gradient Builder
          </h2>
          <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            Page preview. Controls stay in this sidebar.
          </p>
        </div>
        {previewModeSwitch}
        {controls}
      </aside>,
      document.body,
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Gradient Builder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Multi-layer gradients with stop opacity, position offset, and a live page background.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        {previewModeSwitch}
        <div
          className={`${PREVIEW_FRAME[previewMode]} border border-stone-200 dark:border-stone-700`}
          style={{ backgroundImage }}
        />
        {controls}
      </div>
    </div>
  );
}
