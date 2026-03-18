import { useState, useCallback } from "react";
import CopyArea from "../components/CopyArea";

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
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          HTML Entity Encoder
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Encode and decode HTML entities.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
          <button
            className={`px-3 py-1.5 transition-colors ${
              mode === "encode"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
            onClick={() => setMode("encode")}
          >
            Encode
          </button>
          <button
            className={`px-3 py-1.5 transition-colors ${
              mode === "decode"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
            onClick={() => setMode("decode")}
          >
            Decode
          </button>
        </div>

        <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
          Input
        </label>
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
          className="w-full h-32 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
        />

        <div className="flex justify-end">
          <button
            onClick={process}
            className="px-4 py-2 border border-stone-400 dark:border-stone-600 text-xs font-mono tracking-tight text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {mode === "encode" ? "> Encode" : "> Decode"}
          </button>
        </div>

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
