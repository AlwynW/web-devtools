import { useState, useMemo } from "react";
import yaml from "js-yaml";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

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
      <PageHeader title="YAML ↔ JSON Converter" description="Convert between YAML and JSON. Paste input, get output." />

      <Panel className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control font-mono text-[11px]">
            <button
              onClick={() => setDirection("yamlToJson")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "yamlToJson"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              YAML → JSON
            </button>
            <button
              onClick={() => setDirection("jsonToYaml")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "jsonToYaml"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              JSON → YAML
            </button>
          </div>
          {output && (
            <button
              onClick={swapDirection}
              className="text-xs font-mono text-fg-muted hover:text-fg"
            >
              Swap
            </button>
          )}
        </div>

        <div>
          <Label>
            Input ({direction === "yamlToJson" ? "YAML" : "JSON"})
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "yamlToJson" ? "key: value\nnested:\n  - item" : '{"key": "value"}'}
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
              Output ({direction === "yamlToJson" ? "JSON" : "YAML"})
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
