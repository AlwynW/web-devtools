import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TAILWIND_CLASSES } from "../data/tailwindClasses";
import { copyToClipboard } from "../utils/clipboard";

export default function TailwindSearch({ onToast }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TAILWIND_CLASSES;
    return TAILWIND_CLASSES.filter(
      (c) =>
        c.class.toLowerCase().includes(q) ||
        c.property.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q),
    );
  }, [query]);

  const copy = (cls) => {
    copyToClipboard(cls, () => onToast("Class copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Tailwind Class Search
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Quick reference for z-index, flex-basis, and other utilities.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes (e.g. z-50, flex-basis, justify)"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="max-h-[32rem] overflow-y-auto space-y-2">
          {results.map((c) => (
            <div
              key={c.class}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <code className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {c.class}
                </code>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {c.property}
                  </span>
                  {" → "}
                  <span className="font-mono text-xs">{c.value}</span>
                </div>
              </div>
              <button
                onClick={() => copy(c.class)}
                className="ml-3 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No matching classes found.
          </div>
        )}
      </div>
    </div>
  );
}
