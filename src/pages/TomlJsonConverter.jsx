import { useMemo, useState } from "react";
import toml from "@iarna/toml";
import CopyArea from "../components/CopyArea";

export default function TomlJsonConverter({ onToast }) {
  const [direction, setDirection] = useState("tomlToJson");
  const [input, setInput] = useState(`title = "DevKit"
[server]
port = 5173
enabled = true`);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (direction === "tomlToJson") {
        const obj = toml.parse(input);
        return { output: JSON.stringify(obj, null, 2), error: null };
      }
      const obj = JSON.parse(input);
      return { output: toml.stringify(obj), error: null };
    } catch (e) {
      return { output: "", error: e.message || "Invalid input" };
    }
  }, [input, direction]);

  const swapDirection = () => {
    setDirection((d) => (d === "tomlToJson" ? "jsonToToml" : "tomlToJson"));
    if (output) setInput(output);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          TOML ↔ JSON
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between TOML and JSON in the browser.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setDirection("tomlToJson")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "tomlToJson"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              TOML → JSON
            </button>
            <button
              type="button"
              onClick={() => setDirection("jsonToToml")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "jsonToToml"
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              JSON → TOML
            </button>
          </div>
          {output && (
            <button
              type="button"
              onClick={swapDirection}
              className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
            >
              Swap
            </button>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input ({direction === "tomlToJson" ? "TOML" : "JSON"})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "tomlToJson"
                ? 'key = "value"\n[nested]\nflag = true'
                : '{"key": "value"}'
            }
            className="w-full h-48 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {output && !error && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Output ({direction === "tomlToJson" ? "JSON" : "TOML"})
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
