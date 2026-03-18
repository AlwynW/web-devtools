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
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          JSON Formatter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Format and validate JSON with pretty-print and error reporting.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-40 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
        />

        <div className="flex gap-2">
          <Button onClick={format}>Format</Button>
          <Button onClick={validate} variant="secondary">
            Validate
          </Button>
        </div>

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
