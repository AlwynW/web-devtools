import { useState, useCallback } from "react";
import CopyArea from "../components/CopyArea";

export default function Base64Encoder({ onToast }) {
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
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError("Invalid Base64 input");
      setOutput("");
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Base64 Encoder
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Encode and decode Base64 strings.
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
            setError(null);
          }}
          onBlur={process}
          placeholder={mode === "encode" ? "Enter text to encode" : "Enter Base64 to decode"}
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
        />

        <button
          onClick={process}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

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
