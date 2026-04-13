import { useMemo, useState } from "react";
import { parse, print, stripIgnoredCharacters } from "graphql";
import CopyArea from "../components/CopyArea";

const SAMPLE = `query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}`;

export default function GraphqlFormat({ onToast }) {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState("pretty");

  const { output, error } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { output: "", error: null };
    try {
      const doc = parse(trimmed, { noLocation: true });
      const printed = print(doc);
      if (mode === "minify") {
        return { output: stripIgnoredCharacters(printed), error: null };
      }
      return { output: printed, error: null };
    } catch (e) {
      return { output: "", error: e.message || "Invalid GraphQL" };
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          GraphQL format
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Parse and print GraphQL documents. Validates syntax; no server.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px] w-fit">
          <button
            type="button"
            onClick={() => setMode("pretty")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "pretty"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Pretty
          </button>
          <button
            type="button"
            onClick={() => setMode("minify")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "minify"
                ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            Minify
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="query { field }"
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
              Output
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
