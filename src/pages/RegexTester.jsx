import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";

const TOKEN_GUIDE = [
  { pattern: ".", desc: "Any character except newline" },
  { pattern: "\\d", desc: "Digit (0-9)" },
  { pattern: "\\D", desc: "Non-digit" },
  { pattern: "\\w", desc: "Word character (a-z, A-Z, 0-9, _)" },
  { pattern: "\\W", desc: "Non-word character" },
  { pattern: "\\s", desc: "Whitespace" },
  { pattern: "\\S", desc: "Non-whitespace" },
  { pattern: "^", desc: "Start of string (or line with m)" },
  { pattern: "$", desc: "End of string (or line with m)" },
  { pattern: "\\b", desc: "Word boundary" },
  { pattern: "\\B", desc: "Non-word boundary" },
  { pattern: "[abc]", desc: "Any of a, b, or c" },
  { pattern: "[^abc]", desc: "Not a, b, or c" },
  { pattern: "[a-z]", desc: "Character range" },
  { pattern: "a|b", desc: "a or b" },
  { pattern: "a?", desc: "Zero or one a" },
  { pattern: "a*", desc: "Zero or more a" },
  { pattern: "a+", desc: "One or more a" },
  { pattern: "a{3}", desc: "Exactly 3 a's" },
  { pattern: "a{3,}", desc: "3 or more a's" },
  { pattern: "a{3,5}", desc: "3 to 5 a's" },
  { pattern: "(a)", desc: "Capture group" },
  { pattern: "(?:a)", desc: "Non-capture group" },
  { pattern: "g", desc: "Global - all matches" },
  { pattern: "i", desc: "Case insensitive" },
  { pattern: "m", desc: "Multiline (^ $ per line)" },
];

export default function RegexTester({ onToast }) {
  const [pattern, setPattern] = useState("\\d{3}-\\d{3}-\\d{4}");
  const [testString, setTestString] = useState("Call 555-123-4567 or 555-987-6543");
  const [flags, setFlags] = useState("g");
  const [replaceWith, setReplaceWith] = useState("");
  const [showExplainer, setShowExplainer] = useState(false);

  const result = useMemo(() => {
    if (!pattern.trim()) return { error: null, matches: [], replace: null };
    try {
      const re = new RegExp(pattern, flags);
      const matches = [...testString.matchAll(re)];
      const replace =
        replaceWith !== ""
          ? testString.replace(re, replaceWith)
          : null;
      return { error: null, matches, replace };
    } catch (e) {
      return { error: e.message, matches: [], replace: null };
    }
  }, [pattern, testString, flags, replaceWith]);

  const regexCode = `/${pattern.replace(/\//g, "\\/")}/${flags}`;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Regex Tester & Explainer
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Test patterns, view matches and groups, and learn regex syntax.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Regular expression
          </label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-slate-100 dark:bg-slate-900 rounded-l-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-500">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\\d+"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-mono focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <span className="flex items-center px-3 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 font-mono text-slate-500">
              /
            </span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gim"
              className="w-16 px-2 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Test string
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        {result.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-mono">
            {result.error}
          </div>
        )}

        {!result.error && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Matches ({result.matches.length})
              </label>
              {result.matches.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="font-mono text-blue-600 dark:text-blue-400">
                        {m[0]}
                      </div>
                      {m.length > 1 && (
                        <div className="mt-2 text-xs text-slate-500 space-y-1">
                          {m.slice(1).map((g, j) => (
                            <div key={j}>
                              Group {j + 1}: {g ?? "(undefined)"}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        index: {m.index}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 text-center">
                  No matches
                </div>
              )}
            </div>

            {replaceWith !== "" && result.replace !== null && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Replace with
                </label>
                <input
                  type="text"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="Replacement string"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white mb-2"
                />
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm whitespace-pre-wrap dark:text-slate-200">
                  {result.replace}
                </div>
              </div>
            )}

            {replaceWith === "" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Replace (optional)
                </label>
                <input
                  type="text"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="Leave empty to skip"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white"
                />
              </div>
            )}

            <CopyArea
              text={regexCode}
              onCopySuccess={() => onToast("Regex copied!")}
            />
          </>
        )}

        <div>
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showExplainer ? "Hide" : "Show"} regex syntax reference
          </button>
          {showExplainer && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="pb-2 font-mono">Pattern</th>
                    <th className="pb-2 pl-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {TOKEN_GUIDE.map((t, i) => (
                    <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-mono text-blue-600 dark:text-blue-400">
                        {t.pattern}
                      </td>
                      <td className="py-2 pl-4 dark:text-slate-300">
                        {t.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
