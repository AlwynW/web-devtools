import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";

const CONTEXTS = [
  { id: "json", label: "JSON" },
  { id: "regex", label: "Regex" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "shell", label: "Shell" },
];

const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(str) {
  return str.replace(/\\(.)/g, "$1");
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function unescapeSql(str) {
  return str.replace(/''/g, "'");
}

function escapeShell(str) {
  return "'" + str.replace(/'/g, "'\"'\"'") + "'";
}

function unescapeShell(str) {
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return str;
}

export default function EscapeUnescape({ onToast }) {
  const [context, setContext] = useState("json");
  const [mode, setMode] = useState("escape");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      let result;
      if (context === "json") {
        result = mode === "escape"
          ? JSON.stringify(input)
          : JSON.parse(input);
      } else if (context === "regex") {
        result = mode === "escape" ? escapeRegex(input) : unescapeRegex(input);
      } else if (context === "sql") {
        result = mode === "escape" ? escapeSql(input) : unescapeSql(input);
      } else if (context === "html") {
        result = mode === "escape" ? escapeHtml(input) : unescapeHtml(input);
      } else if (context === "shell") {
        result = mode === "escape" ? escapeShell(input) : unescapeShell(input);
      } else {
        result = "";
      }
      return { output: result, error: null };
    } catch (e) {
      return { output: "", error: e.message || "Failed" };
    }
  }, [input, context, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Escape / Unescape
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Escape strings for JSON, regex, SQL, HTML, or shell.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
              Context
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px] flex-wrap">
              {CONTEXTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContext(c.id)}
                  className={`px-3 py-1.5 transition-colors ${
                    context === c.id
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-1">
              Mode
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-[11px]">
              <button
                onClick={() => setMode("escape")}
                className={`px-3 py-1.5 transition-colors ${
                  mode === "escape"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Escape
              </button>
              <button
                onClick={() => setMode("unescape")}
                className={`px-3 py-1.5 transition-colors ${
                  mode === "unescape"
                    ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                    : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Unescape
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "escape" ? "Enter text to escape" : "Enter escaped text"}
            className="w-full h-32 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-sm">
            {error}
          </div>
        )}

        {output !== "" && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Output
            </label>
            <CopyArea
              text={typeof output === "string" ? output : JSON.stringify(output, null, 2)}
              onCopySuccess={() => onToast("Copied!")}
            />
          </>
        )}
      </div>
    </div>
  );
}
