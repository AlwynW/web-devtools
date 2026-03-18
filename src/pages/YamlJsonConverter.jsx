import { useState, useMemo } from "react";
import yaml from "js-yaml";
import CopyArea from "../components/CopyArea";

export default function YamlJsonConverter({ onToast }) {
  const [direction, setDirection] = useState("yamlToJson");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (direction === "yamlToJson") {
        const obj = yaml.load(input);
        return { output: JSON.stringify(obj, null, 2), error: null };
      } else {
        const obj = JSON.parse(input);
        return { output: yaml.dump(obj, { lineWidth: -1 }), error: null };
      }
    } catch (e) {
      return { output: "", error: e.message || "Invalid input" };
    }
  }, [input, direction]);

  const swapDirection = () => {
    setDirection((d) => (d === "yamlToJson" ? "jsonToYaml" : "yamlToJson"));
    if (output) setInput(output);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          YAML ↔ JSON Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between YAML and JSON. Paste input, get output.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
            <button
              onClick={() => setDirection("yamlToJson")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "yamlToJson"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              YAML → JSON
            </button>
            <button
              onClick={() => setDirection("jsonToYaml")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "jsonToYaml"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              JSON → YAML
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

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input ({direction === "yamlToJson" ? "YAML" : "JSON"})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "yamlToJson" ? "key: value\nnested:\n  - item" : '{"key": "value"}'}
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
              Output ({direction === "yamlToJson" ? "JSON" : "YAML"})
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
