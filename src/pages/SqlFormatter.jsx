import { useState } from "react";
import { format } from "sql-formatter";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";

const DIALECTS = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
];

export default function SqlFormatter({ onToast }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [dialect, setDialect] = useState("sql");

  const doFormat = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(format(input, { language: dialect }));
    } catch (e) {
      setError(e.message || "Format failed");
      setOutput("");
    }
  };

  const doMinify = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const formatted = format(input, { language: dialect });
      setOutput(formatted.replace(/\s+/g, " ").trim());
    } catch (e) {
      setError(e.message || "Minify failed");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          SQL Formatter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Format and minify SQL queries.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
              Dialect
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={doFormat}>Format</Button>
            <Button onClick={doMinify} variant="secondary">
              Minify
            </Button>
          </div>
        </div>

        <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
          Input SQL
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = 1"
          className="w-full h-40 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
        />

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {output && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Output
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
