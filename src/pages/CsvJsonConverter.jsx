import { useState, useMemo } from "react";
import Papa from "papaparse";
import CopyArea from "../components/CopyArea";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          CSV ↔ JSON Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between CSV and JSON. Paste input, get output.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
              <button
                onClick={() => setDirection("csvToJson")}
                className={`px-3 py-1.5 transition-colors ${
                  direction === "csvToJson"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                CSV → JSON
              </button>
              <button
                onClick={() => setDirection("jsonToCsv")}
                className={`px-3 py-1.5 transition-colors ${
                  direction === "jsonToCsv"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                JSON → CSV
              </button>
            </div>
            {output && (
              <button
                onClick={swapDirection}
                className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Swap
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
              {DELIMITERS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDelimiterKey(d.key)}
                  className={`px-3 py-1.5 transition-colors ${
                    delimiterKey === d.key
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={headerRow}
                onChange={(e) => setHeaderRow(e.target.checked)}
                className="border-stone-400 focus:ring-stone-500"
              />
              <span className="text-xs font-mono text-stone-600 dark:text-stone-300">Header</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input ({direction === "csvToJson" ? "CSV" : "JSON"})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "csvToJson" ? "name,age\nAlice,30\nBob,25" : '[{"name":"Alice","age":30}]'}
            className="w-full h-48 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {output && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Output ({direction === "csvToJson" ? "JSON" : "CSV"})
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
