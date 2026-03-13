import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

const initialShadow = {
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#00000020",
};

const defaultLayer = () => ({
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#00000015",
});

const initialGradient = {
  type: "linear",
  angle: 90,
  radialShape: "ellipse",
  radialSize: "farthest-corner",
  radialPos: "center",
  stops: [
    { color: "#3b82f6", pos: 0 },
    { color: "#8b5cf6", pos: 100 },
  ],
};

const PREVIEW_BG_LIGHT = "#f1f5f9";
const PREVIEW_BG_DARK = "#1e293b";

export default function CssGenerator({ onToast }) {
  const [mode, setMode] = useState("shadow");
  const [shadow, setShadow] = useState(initialShadow);
  const [shadowPreviewBg, setShadowPreviewBg] = useState("light");
  const [shadowPreviewColor, setShadowPreviewColor] = useState("#f1f5f9");
  const [shadowBoxColor, setShadowBoxColor] = useState("#ffffff");
  const [layers, setLayers] = useState([
    defaultLayer(),
    { ...defaultLayer(), y: 8, blur: 24, color: "#00000008" },
  ]);
  const [gradient, setGradient] = useState(initialGradient);

  const shadowCss = `box-shadow: ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color};`;
  const shadowBuilderCss = `box-shadow: ${layers.map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`).join(", ")};`;

  const addLayer = () => setLayers([...layers, defaultLayer()]);
  const updateLayer = (i, field, val) => {
    const next = [...layers];
    next[i] = { ...next[i], [field]: typeof val === "number" ? val : val };
    setLayers(next);
  };
  const removeLayer = (i) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((_, j) => j !== i));
  };

  const shadowPreviewBgColor =
    shadowPreviewBg === "light"
      ? PREVIEW_BG_LIGHT
      : shadowPreviewBg === "dark"
        ? PREVIEW_BG_DARK
        : shadowPreviewColor;

  const gradientCss =
    gradient.type === "radial"
      ? `background: radial-gradient(${gradient.radialShape} ${gradient.radialSize} at ${gradient.radialPos}, ${gradient.stops.map((s) => `${s.color} ${s.pos}%`).join(", ")});`
      : `background: linear-gradient(${gradient.angle}deg, ${gradient.stops.map((s) => `${s.color} ${s.pos}%`).join(", ")});`;

  const addStop = () => {
    const last = gradient.stops[gradient.stops.length - 1];
    setGradient({
      ...gradient,
      stops: [
        ...gradient.stops,
        { color: "#94a3b8", pos: last ? last.pos + 10 : 50 },
      ],
    });
  };

  const updateStop = (i, field, val) => {
    const next = [...gradient.stops];
    next[i] = { ...next[i], [field]: val };
    setGradient({ ...gradient, stops: next });
  };

  const removeStop = (i) => {
    if (gradient.stops.length <= 2) return;
    setGradient({
      ...gradient,
      stops: gradient.stops.filter((_, j) => j !== i),
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Box-Shadow & Gradient
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Visual sliders that output the exact CSS code.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max flex-wrap">
          {[
            { id: "shadow", label: "Box-Shadow" },
            { id: "shadow-builder", label: "Shadow Builder" },
            { id: "gradient", label: "Gradient" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                mode === m.id
                  ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "shadow" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-full max-w-xs aspect-square rounded-2xl flex items-center justify-center p-8 border border-slate-200 dark:border-slate-600"
                style={{ backgroundColor: shadowPreviewBgColor }}
              >
                <div
                  className="w-32 h-32 rounded-xl"
                  style={{
                    backgroundColor: shadowBoxColor,
                    boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`,
                  }}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {[
                    { id: "light", label: "Light" },
                    { id: "dark", label: "Dark" },
                    { id: "custom", label: "Custom" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setShadowPreviewBg(m.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        shadowPreviewBg === m.id
                          ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {shadowPreviewBg === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shadowPreviewColor.slice(0, 7)}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={shadowPreviewColor}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-white"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Box:
                  </span>
                  <input
                    type="color"
                    value={shadowBoxColor.slice(0, 7)}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={shadowBoxColor}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "x", label: "X", min: -50, max: 50 },
                { key: "y", label: "Y", min: -50, max: 50 },
                { key: "blur", label: "Blur", min: 0, max: 50 },
                { key: "spread", label: "Spread", min: -20, max: 20 },
              ].map(({ key, label, min, max }) => (
                <div key={key}>
                  <label className="flex justify-between text-sm font-medium mb-1 dark:text-slate-300">
                    <span>{label}</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {shadow[key]}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={shadow[key]}
                    onChange={(e) =>
                      setShadow({ ...shadow, [key]: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shadow.color.slice(0, 7)}
                  onChange={(e) =>
                    setShadow({ ...shadow, color: e.target.value })
                  }
                  className="w-12 h-10 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={shadow.color}
                  onChange={(e) =>
                    setShadow({ ...shadow, color: e.target.value })
                  }
                  placeholder="#000000 or #00000080"
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                />
              </div>
            </div>
            <CopyArea
              text={shadowCss}
              onCopySuccess={() => onToast("CSS copied!")}
            />
          </>
        )}

        {mode === "shadow-builder" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-full max-w-xs aspect-square rounded-2xl flex items-center justify-center p-8 border border-slate-200 dark:border-slate-600"
                style={{ backgroundColor: shadowPreviewBgColor }}
              >
                <div
                  className="w-36 h-36 rounded-2xl"
                  style={{
                    backgroundColor: shadowBoxColor,
                    boxShadow: shadowBuilderCss.replace("box-shadow: ", "").replace(";", ""),
                  }}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {[
                    { id: "light", label: "Light" },
                    { id: "dark", label: "Dark" },
                    { id: "custom", label: "Custom" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setShadowPreviewBg(m.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        shadowPreviewBg === m.id
                          ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {shadowPreviewBg === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shadowPreviewColor.slice(0, 7)}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={shadowPreviewColor}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-white"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Box:
                  </span>
                  <input
                    type="color"
                    value={shadowBoxColor.slice(0, 7)}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={shadowBoxColor}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {layers.map((layer, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      Layer {i + 1}
                    </span>
                    <button
                      onClick={() => removeLayer(i)}
                      disabled={layers.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove layer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "x", label: "X", min: -80, max: 80 },
                      { key: "y", label: "Y", min: -80, max: 80 },
                      { key: "blur", label: "Blur", min: 0, max: 80 },
                      { key: "spread", label: "Spread", min: -40, max: 40 },
                    ].map(({ key, label, min, max }) => (
                      <div key={key}>
                        <label className="flex justify-between text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
                          <span>{label}</span>
                          <span>{layer[key]}</span>
                        </label>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={layer[key]}
                          onChange={(e) =>
                            updateLayer(i, key, parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layer.color.slice(0, 7)}
                      onChange={(e) => updateLayer(i, "color", e.target.value)}
                      className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layer.color}
                      onChange={(e) => updateLayer(i, "color", e.target.value)}
                      placeholder="#00000020"
                      className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={addLayer} icon={Plus} variant="outline">
              Add layer
            </Button>
            <CopyArea
              text={shadowBuilderCss}
              onCopySuccess={() => onToast("CSS copied!")}
            />
          </>
        )}

        {mode === "gradient" && (
          <>
            <div className="flex justify-center">
              <div
                className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-600"
                style={{
                  background:
                    gradient.type === "radial"
                      ? `radial-gradient(${gradient.radialShape} ${gradient.radialSize} at ${gradient.radialPos}, ${gradient.stops.map((s) => `${s.color} ${s.pos}%`).join(", ")})`
                      : `linear-gradient(${gradient.angle}deg, ${gradient.stops.map((s) => `${s.color} ${s.pos}%`).join(", ")})`,
                }}
              />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max">
              {[
                { id: "linear", label: "Linear" },
                { id: "radial", label: "Radial" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setGradient({ ...gradient, type: m.id })}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    gradient.type === m.id
                      ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {gradient.type === "linear" && (
              <div>
                <label className="flex justify-between text-sm font-medium mb-1 dark:text-slate-300">
                  <span>Angle</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {gradient.angle}deg
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradient.angle}
                  onChange={(e) =>
                    setGradient({
                      ...gradient,
                      angle: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
              </div>
            )}
            {gradient.type === "radial" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Shape
                  </label>
                  <select
                    value={gradient.radialShape}
                    onChange={(e) =>
                      setGradient({ ...gradient, radialShape: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  >
                    <option value="circle">circle</option>
                    <option value="ellipse">ellipse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Size
                  </label>
                  <select
                    value={gradient.radialSize}
                    onChange={(e) =>
                      setGradient({ ...gradient, radialSize: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  >
                    <option value="closest-side">closest-side</option>
                    <option value="closest-corner">closest-corner</option>
                    <option value="farthest-side">farthest-side</option>
                    <option value="farthest-corner">farthest-corner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Position
                  </label>
                  <select
                    value={gradient.radialPos}
                    onChange={(e) =>
                      setGradient({ ...gradient, radialPos: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                  >
                    <option value="center">center</option>
                    <option value="top">top</option>
                    <option value="bottom">bottom</option>
                    <option value="left">left</option>
                    <option value="right">right</option>
                    <option value="top left">top left</option>
                    <option value="top right">top right</option>
                    <option value="bottom left">bottom left</option>
                    <option value="bottom right">bottom right</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium dark:text-slate-300">
                  Color stops
                </label>
                <button
                  onClick={addStop}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add stop
                </button>
              </div>
              <div className="space-y-4">
                {gradient.stops.map((stop, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Stop {i + 1}
                      </span>
                      {gradient.stops.length > 2 && (
                        <button
                          onClick={() => removeStop(i)}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) =>
                          updateStop(i, "color", e.target.value)
                        }
                        className="w-10 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) =>
                          updateStop(i, "color", e.target.value)
                        }
                        className="w-24 px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs dark:text-white"
                      />
                      <div className="flex-1 min-w-[8rem]">
                        <label className="flex justify-between text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
                          <span>Position</span>
                          <span>{stop.pos}%</span>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={stop.pos}
                          onChange={(e) =>
                            updateStop(i, "pos", parseInt(e.target.value) || 0)
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                        />
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.pos}
                        onChange={(e) =>
                          updateStop(i, "pos", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                        }
                        className="w-14 px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm dark:text-white"
                      />
                      <span className="text-slate-500 text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <CopyArea
              text={gradientCss}
              onCopySuccess={() => onToast("CSS copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}
