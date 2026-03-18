import { useState } from "react";
import Papa from "papaparse";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

export default function CsvJsonConverter({ onToast }) {
  const [csvInput, setCsvInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [headerRow, setHeaderRow] = useState(true);

  const csvToJson = () => {
    setError(null);
    if (!csvInput.trim()) {
      setJsonInput("");
      return;
    }
    try {
      const result = Papa.parse(csvInput, {
        delimiter: delimiter === "tab" ? "\t" : delimiter,
        header: headerRow,
      });
      if (result.errors.length) {
        setError(result.errors[0].message);
        setJsonInput("");
      } else {
        setJsonInput(JSON.stringify(result.data, null, 2));
      }
    } catch (e) {
      setError(e.message || "Invalid CSV");
      setJsonInput("");
    }
  };

  const jsonToCsv = () => {
    setError(null);
    if (!jsonInput.trim()) {
      setCsvInput("");
      return;
    }
    try {
      const data = JSON.parse(jsonInput);
      const arr = Array.isArray(data) ? data : [data];
      const csv = Papa.unparse(arr, {
        delimiter: delimiter === "tab" ? "\t" : delimiter,
        header: headerRow,
      });
      setCsvInput(csv);
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setCsvInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          CSV ↔ JSON Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between CSV and JSON with configurable options.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
              Delimiter
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
              {["comma", "tab", "semicolon"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDelimiter(d)}
                  className={`px-3 py-1.5 transition-colors ${
                    delimiter === d
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input
              type="checkbox"
              checked={headerRow}
              onChange={(e) => setHeaderRow(e.target.checked)}
              className="border-stone-400 focus:ring-stone-500"
            />
            <span className="text-sm font-mono text-stone-600 dark:text-stone-300">Header row</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button onClick={csvToJson}>CSV → JSON</Button>
          <Button onClick={jsonToCsv} variant="secondary">
            JSON → CSV
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              CSV
            </label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="name,age&#10;Alice,30&#10;Bob,25"
              className="w-full h-48 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"name":"Alice","age":30}]'
              className="w-full h-48 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
