import { useState } from "react";
import yaml from "js-yaml";
import CopyArea from "../components/CopyArea";
import Button from "../components/Button";

export default function YamlJsonConverter({ onToast }) {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  const [lastConverted, setLastConverted] = useState(null);

  const yamlToJson = () => {
    setError(null);
    setLastConverted("yaml");
    if (!yamlInput.trim()) {
      setJsonInput("");
      return;
    }
    try {
      const obj = yaml.load(yamlInput);
      setJsonInput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setError(e.message || "Invalid YAML");
      setJsonInput("");
    }
  };

  const jsonToYaml = () => {
    setError(null);
    setLastConverted("json");
    if (!jsonInput.trim()) {
      setYamlInput("");
      return;
    }
    try {
      const obj = JSON.parse(jsonInput);
      setYamlInput(yaml.dump(obj, { lineWidth: -1 }));
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setYamlInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          YAML ↔ JSON Converter
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert between YAML and JSON formats.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex gap-2">
          <Button onClick={yamlToJson}>YAML → JSON</Button>
          <Button onClick={jsonToYaml} variant="secondary">
            JSON → YAML
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
              YAML
            </label>
            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              placeholder="key: value"
              className="w-full h-64 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
            {lastConverted === "json" && jsonInput && (
              <div className="mt-2">
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                  Output
                </label>
                <CopyArea text={yamlInput} onCopySuccess={() => onToast("Copied!")} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-64 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
            {lastConverted === "yaml" && jsonInput && (
              <div className="mt-2">
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
                  Output
                </label>
                <CopyArea text={jsonInput} onCopySuccess={() => onToast("Copied!")} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
