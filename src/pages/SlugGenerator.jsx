import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";

const DEFAULT_REPLACEMENTS = [
  { from: "&", to: "and" },
  { from: "@", to: "at" },
  { from: "+", to: "plus" },
];

function slugify(text, options) {
  if (!text?.trim()) return "";
  let slug = text.trim();

  const { separator, lowercase, maxLength, stripSpecialChars, customReplacements, preserveUnicode } = options;

  for (const { from, to } of customReplacements) {
    if (from && to) {
      slug = slug.split(from).join(to);
    }
  }

  if (!preserveUnicode) {
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (stripSpecialChars) {
    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, " ");
  }

  slug = slug.replace(/\s+/g, separator);
  slug = slug.replace(new RegExp(`\\${separator}+`, "g"), separator);
  slug = slug.replace(new RegExp(`^\\${separator}|\\${separator}$`, "g"), "");

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (maxLength && maxLength > 0) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`\\${separator}[^\\${separator}]*$`), "");
  }

  return slug;
}

export default function SlugGenerator({ onToast }) {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState("");
  const [stripSpecialChars, setStripSpecialChars] = useState(true);
  const [preserveUnicode, setPreserveUnicode] = useState(false);
  const [customReplacements, setCustomReplacements] = useState(DEFAULT_REPLACEMENTS);

  const output = useMemo(
    () =>
      slugify(input, {
        separator,
        lowercase,
        maxLength: maxLength ? parseInt(maxLength, 10) : 0,
        stripSpecialChars,
        customReplacements,
        preserveUnicode,
      }),
    [input, separator, lowercase, maxLength, stripSpecialChars, customReplacements, preserveUnicode]
  );

  const updateReplacement = (index, field, value) => {
    setCustomReplacements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addReplacement = () => {
    setCustomReplacements((prev) => [...prev, { from: "", to: "" }]);
  };

  const removeReplacement = (index) => {
    setCustomReplacements((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Slug Generator
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Convert text to URL-friendly slugs with full options.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-6">
        <div>
          <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
            Input text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello World! This is a title."
            className="w-full h-24 p-4 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Separator
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max font-mono text-[11px]">
              {["-", "_"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeparator(s)}
                  className={`px-3 py-1.5 transition-colors ${
                    separator === s
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {s === "-" ? "hyphen" : "underscore"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Max length
            </label>
            <input
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              placeholder="No limit"
              min="1"
              className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="border-stone-400 focus:ring-stone-500"
            />
            <span className="text-sm font-mono text-stone-600 dark:text-stone-300">Lowercase</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stripSpecialChars}
              onChange={(e) => setStripSpecialChars(e.target.checked)}
              className="border-stone-400 focus:ring-stone-500"
            />
            <span className="text-sm font-mono text-stone-600 dark:text-stone-300">Strip special chars</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveUnicode}
              onChange={(e) => setPreserveUnicode(e.target.checked)}
              className="border-stone-400 focus:ring-stone-500"
            />
            <span className="text-sm font-mono text-stone-600 dark:text-stone-300">Preserve unicode</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
              Custom replacements
            </label>
            <button
              onClick={addReplacement}
              className="text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {customReplacements.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={r.from}
                  onChange={(e) => updateReplacement(i, "from", e.target.value)}
                  placeholder="from"
                  className="flex-1 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm"
                />
                <span className="text-stone-400">→</span>
                <input
                  type="text"
                  value={r.to}
                  onChange={(e) => updateReplacement(i, "to", e.target.value)}
                  placeholder="to"
                  className="flex-1 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm"
                />
                <button
                  onClick={() => removeReplacement(i)}
                  className="p-2 text-stone-500 hover:text-red-600"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {output && (
          <>
            <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em] mb-2">
              Output slug
            </label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </div>
    </div>
  );
}
