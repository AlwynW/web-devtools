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
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          HTML Entity Encoder
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Encode and decode HTML entities.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max">
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "encode" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            onClick={() => setMode("encode")}
          >
            Encode
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "decode" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            onClick={() => setMode("decode")}
          >
            Decode
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              ? 'Enter text with < & " \' > to encode'
              : "Enter HTML entities to decode"
          }
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        <button
          onClick={process}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </button>

        {output && (
          <>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Output
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
