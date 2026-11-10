import { useState, useCallback } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const ENTITIES_REV = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
};

const encodeHtml = (str) => {
  return str.replace(/[&<>"']/g, (c) => ENTITIES[c] || c);
};

const decodeHtml = (str) => {
  return str.replace(
    /&(?:amp|lt|gt|quot|#39|#x27);/g,
    (m) => ENTITIES_REV[m] ?? m,
  );
};

export default function HtmlEntityEncoder({ onToast }) {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const process = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (mode === "encode") {
      setOutput(encodeHtml(input));
    } else {
      setOutput(decodeHtml(input));
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="HTML Entity Encoder" description="Encode and decode HTML entities." />

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
          }}
          onBlur={process}
          placeholder={
            mode === "encode"
              ? '> enter text with < & " \' > to encode'
              : "> enter HTML entities to decode"
          }
          className="w-full h-32 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
        />

        <div className="flex justify-end">
          <button
            onClick={process}
            className="px-4 py-2 border border-border-muted text-xs font-mono tracking-tight text-fg bg-surface hover:bg-hover-muted transition-colors"
          >
            {mode === "encode" ? "> Encode" : "> Decode"}
          </button>
        </div>

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
