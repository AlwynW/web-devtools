import { useState } from "react";
import { Plus, Trash } from "phosphor-react";
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

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Box-Shadow Builder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Visual controls to fine-tune single and layered shadows.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max flex-wrap font-mono text-[11px]">
          {[
            { id: "shadow", label: "Box-Shadow" },
            { id: "shadow-builder", label: "Shadow Builder" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 transition-colors ${
                mode === m.id
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
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
                className="w-full max-w-xs aspect-square  flex items-center justify-center p-8 border border-stone-200 dark:border-stone-600"
                style={{ backgroundColor: shadowPreviewBgColor }}
              >
                <div
                  className="w-32 h-32 "
                  style={{
                    backgroundColor: shadowBoxColor,
                    boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`,
                  }}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 ">
                  {[
                    { id: "light", label: "Light" },
                    { id: "dark", label: "Dark" },
                    { id: "custom", label: "Custom" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setShadowPreviewBg(m.id)}
                      className={`px-3 py-1.5  text-sm font-medium transition-all ${
                        shadowPreviewBg === m.id
                          ? "bg-white dark:bg-stone-700 shadow text-stone-600 dark:text-stone-400"
                          : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
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
                      className="w-10 h-8  border border-stone-200 dark:border-stone-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={shadowPreviewColor}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-24 px-2 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-xs dark:text-white"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Box:
                  </span>
                  <input
                    type="color"
                    value={shadowBoxColor.slice(0, 7)}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-10 h-8  border border-stone-200 dark:border-stone-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={shadowBoxColor}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-xs dark:text-white"
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
                  <label className="flex justify-between text-sm font-medium mb-1 dark:text-stone-300">
                    <span>{label}</span>
                    <span className="text-stone-600 dark:text-stone-400">
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
                    className="w-full h-2 bg-stone-200  appearance-none cursor-pointer dark:bg-stone-700 accent-stone-600"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-stone-300">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shadow.color.slice(0, 7)}
                  onChange={(e) =>
                    setShadow({ ...shadow, color: e.target.value })
                  }
                  className="w-12 h-10  border border-stone-200 dark:border-stone-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={shadow.color}
                  onChange={(e) =>
                    setShadow({ ...shadow, color: e.target.value })
                  }
                  placeholder="#000000 or #00000080"
                  className="flex-1 px-3 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-sm dark:text-white"
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
                className="w-full max-w-xs aspect-square  flex items-center justify-center p-8 border border-stone-200 dark:border-stone-600"
                style={{ backgroundColor: shadowPreviewBgColor }}
              >
                <div
                  className="w-36 h-36 "
                  style={{
                    backgroundColor: shadowBoxColor,
                    boxShadow: shadowBuilderCss.replace("box-shadow: ", "").replace(";", ""),
                  }}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 ">
                  {[
                    { id: "light", label: "Light" },
                    { id: "dark", label: "Dark" },
                    { id: "custom", label: "Custom" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setShadowPreviewBg(m.id)}
                      className={`px-3 py-1.5  text-sm font-medium transition-all ${
                        shadowPreviewBg === m.id
                          ? "bg-white dark:bg-stone-700 shadow text-stone-600 dark:text-stone-400"
                          : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
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
                      className="w-10 h-8  border border-stone-200 dark:border-stone-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={shadowPreviewColor}
                      onChange={(e) => setShadowPreviewColor(e.target.value)}
                      className="w-24 px-2 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-xs dark:text-white"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Box:
                  </span>
                  <input
                    type="color"
                    value={shadowBoxColor.slice(0, 7)}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-10 h-8  border border-stone-200 dark:border-stone-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={shadowBoxColor}
                    onChange={(e) => setShadowBoxColor(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-xs dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {layers.map((layer, i) => (
                <div
                  key={i}
                  className="p-4  border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-600 dark:text-stone-300">
                      Layer {i + 1}
                    </span>
                    <button
                      onClick={() => removeLayer(i)}
                      disabled={layers.length <= 1}
                      className="p-1.5  text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove layer"
                    >
                      <Trash size={16} weight="thin" />
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
                        <label className="flex justify-between text-xs font-medium mb-1 text-stone-500 dark:text-stone-400">
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
                          className="w-full h-2 bg-stone-200  appearance-none cursor-pointer dark:bg-stone-700 accent-stone-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layer.color.slice(0, 7)}
                      onChange={(e) => updateLayer(i, "color", e.target.value)}
                      className="w-10 h-8  border border-stone-200 dark:border-stone-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layer.color}
                      onChange={(e) => updateLayer(i, "color", e.target.value)}
                      placeholder="#00000020"
                      className="flex-1 px-2 py-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700  font-mono text-xs dark:text-white"
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

      </div>
    </div>
  );
}
