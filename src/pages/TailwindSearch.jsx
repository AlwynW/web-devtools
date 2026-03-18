import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
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
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Tailwind Class Search
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Quick reference for z-index, flex-basis, and other utilities.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="thin"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="> search classes (e.g. z-50, flex-basis, justify)"
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="max-h-[32rem] overflow-y-auto space-y-2">
          {results.map((c) => (
            <div
              key={c.class}
              className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <code className="font-mono font-bold text-stone-800 dark:text-stone-200">
                  {c.class}
                </code>
                <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  <span className="font-mono text-stone-600 dark:text-stone-300">
                    {c.property}
                  </span>
                  {" → "}
                  <span className="font-mono text-xs">{c.value}</span>
                </div>
              </div>
              <button
                onClick={() => copy(c.class)}
                className="ml-3 px-3 py-1.5 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-mono text-sm">
            No matching classes found.
          </div>
        )}
      </div>
    </div>
  );
}
