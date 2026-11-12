import { useState, useMemo } from "react";
import Papa from "papaparse";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import SegmentedControl from "../components/ui/SegmentedControl";
import ErrorBanner from "../components/ui/ErrorBanner";

const DELIMITERS = [
  { key: "auto", char: null, label: "Auto" },
  { key: "comma", char: ",", label: "," },
  { key: "semicolon", char: ";", label: ";" },
  { key: "tab", char: "\t", label: "Tab" },
];

export default function CsvJsonConverter({ onToast }) {
  const [direction, setDirection] = useState("csvToJson");
  const [input, setInput] = useState("");
  const [delimiterKey, setDelimiterKey] = useState("auto");
  const [headerRow, setHeaderRow] = useState(true);

  const delim = DELIMITERS.find((d) => d.key === delimiterKey);
  const delimChar = delim?.char ?? ",";

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (direction === "csvToJson") {
        const parseOpts = { header: headerRow };
        if (delim?.char != null) parseOpts.delimiter = delim.char;
        const result = Papa.parse(input, parseOpts);
        if (result.errors.length) {
          return { output: "", error: result.errors[0].message };
        }
        return { output: JSON.stringify(result.data, null, 2), error: null };
      } else {
        const data = JSON.parse(input);
        const arr = Array.isArray(data) ? data : [data];
        const csv = Papa.unparse(arr, { delimiter: delimChar, header: headerRow });
        return { output: csv, error: null };
      }
    } catch (e) {
      return { output: "", error: e.message || "Invalid input" };
    }
  }, [input, direction, delimChar, delimiterKey, headerRow]);

  const swapDirection = () => {
    setDirection((d) => (d === "csvToJson" ? "jsonToCsv" : "csvToJson"));
    if (output) setInput(output);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="CSV ↔ JSON Converter" description="Convert between CSV and JSON. Paste input, get output." />

      <Panel className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <SegmentedControl
              options={[
                { value: "csvToJson", label: "CSV → JSON" },
                { value: "jsonToCsv", label: "JSON → CSV" },
              ]}
              value={direction}
              onChange={setDirection}
            />
            {output && (
              <button
                onClick={swapDirection}
                className="text-xs font-mono text-fg-muted hover:text-fg"
              >
                Swap
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SegmentedControl
              options={DELIMITERS.map((d) => ({ value: d.key, label: d.label }))}
              value={delimiterKey}
              onChange={setDelimiterKey}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={headerRow}
                onChange={(e) => setHeaderRow(e.target.checked)}
                className="border-border-muted focus:ring-focus"
              />
              <span className="text-xs font-mono text-fg-muted">Header</span>
            </label>
          </div>
        </div>

        <div>
          <Label>
            Input ({direction === "csvToJson" ? "CSV" : "JSON"})
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "csvToJson" ? "name,age\nAlice,30\nBob,25" : '[{"name":"Alice","age":30}]'}
            className="w-full h-48 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && (
          <>
            <Label>
              Output ({direction === "csvToJson" ? "JSON" : "CSV"})
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
