import { useState } from "react";
import { Plus, Trash } from "phosphor-react";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import SegmentedControl from "../components/ui/SegmentedControl";

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
      <PageHeader title="Grid Template Builder" description="Build CSS grid layouts with parameters or named areas." />

      <Panel className="space-y-6">
        <SegmentedControl
          options={[
            { value: "params", label: "Parameters" },
            { value: "areas", label: "Named Areas" },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === "params" && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>
                  Columns
                </Label>
                <Button onClick={addColumn} icon={Plus} variant="outline" size="sm">
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
                      className="flex-1 px-3 py-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={columns.length <= 1}
                      className="p-2 border border-border-strong rounded-button text-fg-subtle hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash size={16} weight="thin" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {PRESET_VALUES.map((v) => (
                  <Button
                    key={v}
                    variant="outline"
                    size="sm"
                    onClick={() => setColumns([...columns, v])}
                  >
                    + {v}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>
                  Rows
                </Label>
                <Button onClick={addRow} icon={Plus} variant="outline" size="sm">
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
                      className="flex-1 px-3 py-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 1}
                      className="p-2 border border-border-strong rounded-button text-fg-subtle hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash size={16} weight="thin" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>
                Gap
              </Label>
              <div className="flex gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-mono text-fg-muted block mb-1">All</span>
                  <input
                    type="text"
                    value={gap}
                    onChange={(e) => setGap(e.target.value)}
                    placeholder="1rem"
                    className="w-24 px-3 py-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono text-fg-muted block mb-1">Row</span>
                  <input
                    type="text"
                    value={rowGap}
                    onChange={(e) => setRowGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono text-fg-muted block mb-1">Column</span>
                  <input
                    type="text"
                    value={columnGap}
                    onChange={(e) => setColumnGap(e.target.value)}
                    placeholder="override"
                    className="w-24 px-3 py-2 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-muted border border-border rounded-control">
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
                      className="bg-secondary-hover flex items-center justify-center text-xs font-mono text-fg-soft"
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
              <Label>
                grid-template-areas (one row per line, space-separated names)
              </Label>
              <textarea
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
                placeholder={`"header header header"
"sidebar main aside"
"footer footer footer"`}
                className="w-full h-32 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
              />
              <p className="text-xs font-mono text-fg-muted mt-1">
                Use the same name to span cells. Each line = one row.
              </p>
            </div>

            {areasPreview.length > 0 && (
              <div>
                <Label>
                  Preview
                </Label>
                <div
                  className="grid gap-2 p-4 bg-surface-muted border border-border rounded-control min-h-[10rem]"
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
                        className="bg-secondary-hover flex items-center justify-center text-sm font-mono text-fg-soft"
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
      </Panel>
    </div>
  );
}
