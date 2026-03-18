import { useState } from "react";
import { Plus, Trash } from "phosphor-react";
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
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Grid Template Builder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Build CSS grid layouts with parameters or named areas.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          {[
            { id: "params", label: "Parameters" },
            { id: "areas", label: "Named Areas" },
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

        {mode === "params" && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
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
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={columns.length <= 1}
                      className="p-2 border border-stone-300 dark:border-stone-700 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash size={16} weight="thin" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {PRESET_VALUES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setColumns([...columns, v])}
                    className="px-2 py-1 text-xs font-mono border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
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
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 1}
                      className="p-2 border border-stone-300 dark:border-stone-700 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash size={16} weight="thin" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                Gap
              </label>
              <div className="flex gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-mono text-stone-500 block mb-1">All</span>
                  <input
                    type="text"
                    value={gap}
                    onChange={(e) => setGap(e.target.value)}
                    placeholder="1rem"
                    className="w-24 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono text-stone-500 block mb-1">Row</span>
                  <input
                    type="text"
                    value={rowGap}
                    onChange={(e) => setRowGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono text-stone-500 block mb-1">Column</span>
                  <input
                    type="text"
                    value={columnGap}
                    onChange={(e) => setColumnGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
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
                      className="bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-mono text-stone-700 dark:text-stone-300"
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
              <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                grid-template-areas (one row per line, space-separated names)
              </label>
              <textarea
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
                placeholder={`"header header header"
"sidebar main aside"
"footer footer footer"`}
                className="w-full h-32 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
              <p className="text-xs font-mono text-stone-500 mt-1">
                Use the same name to span cells. Each line = one row.
              </p>
            </div>

            {areasPreview.length > 0 && (
              <div>
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
                  Preview
                </label>
                <div
                  className="grid gap-2 p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 min-h-[10rem]"
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
                        className="bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-sm font-mono text-stone-700 dark:text-stone-300"
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
