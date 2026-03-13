import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

const PRESET_VALUES = ["1fr", "2fr", "auto", "minmax(0, 1fr)", "100px", "repeat(3, 1fr)"];

export default function GridTemplateBuilder({ onToast }) {
  const [mode, setMode] = useState("params");
  const [columns, setColumns] = useState(["1fr", "1fr", "1fr"]);
  const [rows, setRows] = useState(["auto", "1fr", "auto"]);
  const [gap, setGap] = useState("1rem");
  const [columnGap, setColumnGap] = useState("");
  const [rowGap, setRowGap] = useState("");
  const [areas, setAreas] = useState(`"header header header"
"sidebar main aside"
"footer footer footer"`);

  const addColumn = () => setColumns([...columns, "1fr"]);
  const removeColumn = (i) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, j) => j !== i));
  };
  const updateColumn = (i, v) => {
    const next = [...columns];
    next[i] = v;
    setColumns(next);
  };

  const addRow = () => setRows([...rows, "1fr"]);
  const removeRow = (i) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, j) => j !== i));
  };
  const updateRow = (i, v) => {
    const next = [...rows];
    next[i] = v;
    setRows(next);
  };

  const gapValue = columnGap || rowGap ? `${rowGap || gap} ${columnGap || gap}` : gap;

  const paramsCss = `display: grid;
grid-template-columns: ${columns.join(" ")};
grid-template-rows: ${rows.join(" ")};
gap: ${gapValue};`;

  const areasCss = `display: grid;
grid-template-areas:
  ${areas
    .trim()
    .split("\n")
    .map((line) => line.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
    .map((line) => `"${line.replace(/\s+/g, " ")}"`)
    .join("\n  ")};`;

  const areasPreview = areas
    .trim()
    .split("\n")
    .map((line) => line.replace(/^"|"$/g, "").trim().split(/\s+/))
    .filter((row) => row.some((c) => c));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Grid Template Builder
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Build CSS grid layouts with parameters or named areas.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max">
          {[
            { id: "params", label: "Parameters" },
            { id: "areas", label: "Named Areas" },
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

        {mode === "params" && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium dark:text-slate-300">
                  Columns
                </label>
                <Button onClick={addColumn} icon={Plus} variant="outline" className="text-xs">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {columns.map((col, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumn(i, e.target.value)}
                      placeholder="1fr"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={columns.length <= 1}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {PRESET_VALUES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setColumns([...columns, v])}
                    className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium dark:text-slate-300">
                  Rows
                </label>
                <Button onClick={addRow} icon={Plus} variant="outline" className="text-xs">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row}
                      onChange={(e) => updateRow(i, e.target.value)}
                      placeholder="1fr"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 1}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-2">
                Gap
              </label>
              <div className="flex gap-3 flex-wrap">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">All</span>
                  <input
                    type="text"
                    value={gap}
                    onChange={(e) => setGap(e.target.value)}
                    placeholder="1rem"
                    className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Row</span>
                  <input
                    type="text"
                    value={rowGap}
                    onChange={(e) => setRowGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Column</span>
                  <input
                    type="text"
                    value={columnGap}
                    onChange={(e) => setColumnGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div
                className="grid gap-2 min-h-[8rem]"
                style={{
                  gridTemplateColumns: columns.join(" "),
                  gridTemplateRows: rows.join(" "),
                  gap: gapValue,
                }}
              >
                {columns.flatMap((_, c) =>
                  rows.map((_, r) => (
                    <div
                      key={`${c}-${r}`}
                      className="bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-xs font-mono text-blue-700 dark:text-blue-300"
                    >
                      {c + 1},{r + 1}
                    </div>
                  ))
                )}
              </div>
            </div>

            <CopyArea
              text={paramsCss}
              onCopySuccess={() => onToast("CSS copied!")}
            />
          </>
        )}

        {mode === "areas" && (
          <>
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-2">
                grid-template-areas (one row per line, space-separated names)
              </label>
              <textarea
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
                placeholder={`"header header header"
"sidebar main aside"
"footer footer footer"`}
                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use the same name to span cells. Each line = one row.
              </p>
            </div>

            {areasPreview.length > 0 && (
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-2">
                  Preview
                </label>
                <div
                  className="grid gap-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-h-[10rem]"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(...areasPreview.map((r) => r.length), 1)}, 1fr)`,
                    gridTemplateRows: `repeat(${areasPreview.length}, 1fr)`,
                    gridTemplateAreas: areasPreview
                      .map((row) => `"${row.join(" ")}"`)
                      .join(" "),
                  }}
                >
                  {[...new Set(areasPreview.flat())].map((name) =>
                    name ? (
                      <div
                        key={name}
                        style={{ gridArea: name }}
                        className="bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300"
                      >
                        {name}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            <CopyArea
              text={areasCss}
              onCopySuccess={() => onToast("CSS copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}
