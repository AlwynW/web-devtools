import { useState, useCallback } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function UrlEncoder({ onToast }) {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const process = useCallback(() => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e) {
      setError("Invalid URL-encoded input");
      setOutput("");
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="URL Encoder" description="Encode and decode URL-encoded strings." />

      <Panel className="space-y-4">
        <div className="flex gap-2 p-1 bg-surface-sunken border border-border-strong rounded-control w-max font-mono text-[11px]">
          <button
            className={`px-3 py-1.5 transition-colors ${
              mode === "encode"
                ? "bg-primary text-primary-fg border border-primary-border rounded-button"
                : "text-fg-muted hover:bg-hover-muted"
            }`}
            onClick={() => setMode("encode")}
          >
            Encode
          </button>
          <button
            className={`px-3 py-1.5 transition-colors ${
              mode === "decode"
                ? "bg-primary text-primary-fg border border-primary-border rounded-button"
                : "text-fg-muted hover:bg-hover-muted"
            }`}
            onClick={() => setMode("decode")}
          >
            Decode
          </button>
        </div>

        <Label>
          Input
        </Label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setError(null);
          }}
          onBlur={process}
          placeholder={mode === "encode" ? "> enter text to encode" : "> enter URL-encoded text"}
          className="w-full h-32 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
        />

        <div className="flex justify-end">
          <button
            onClick={process}
            className="px-4 py-2 border border-border-muted text-xs font-mono tracking-tight text-fg bg-surface hover:bg-hover-muted transition-colors"
          >
            {mode === "encode" ? "> encode" : "> decode"}
          </button>
        </div>

        {error && (
          <ErrorBanner className="p-4 text-sm">
            {error}
          </ErrorBanner>
        )}

        {output && (
          <>
            <Label>
              Output
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
