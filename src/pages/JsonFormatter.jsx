import { useState } from "react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";

export default function JsonFormatter({ onToast }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const format = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  const validate = () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      JSON.parse(input);
      setOutput("Valid JSON");
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          JSON Formatter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Format and validate JSON with pretty-print and error reporting.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        <div className="flex gap-2">
          <Button onClick={format}>Format</Button>
          <Button onClick={validate} variant="secondary">
            Validate
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {output && (
          <>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Output
            </label>
            <CopyArea
              text={output}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}
