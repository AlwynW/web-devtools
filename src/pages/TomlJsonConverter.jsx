import { useMemo, useState } from "react";
import toml from "@iarna/toml";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

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
      <PageHeader title="TOML ↔ JSON" description="Convert between TOML and JSON in the browser." />

      <Panel className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setDirection("tomlToJson")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "tomlToJson"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              TOML → JSON
            </button>
            <button
              type="button"
              onClick={() => setDirection("jsonToToml")}
              className={`px-3 py-1.5 transition-colors ${
                direction === "jsonToToml"
                  ? "bg-primary text-primary-fg rounded-button"
                  : "text-fg-muted hover:bg-hover-muted"
              }`}
            >
              JSON → TOML
            </button>
          </div>
          {output && (
            <button
              type="button"
              onClick={swapDirection}
              className="text-xs font-mono text-fg-muted hover:text-fg"
            >
              Swap
            </button>
          )}
        </div>

        <div>
          <Label>
            Input ({direction === "tomlToJson" ? "TOML" : "JSON"})
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "tomlToJson"
                ? 'key = "value"\n[nested]\nflag = true'
                : '{"key": "value"}'
            }
            className="w-full h-48 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {error && (
          <ErrorBanner className="p-4 font-mono text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && !error && (
          <>
            <Label>
              Output ({direction === "tomlToJson" ? "JSON" : "TOML"})
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
