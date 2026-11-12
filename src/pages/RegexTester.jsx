import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";
import ErrorBanner from "../components/ui/ErrorBanner";

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
      <PageHeader title={<>Regex Tester & Explainer</>} description="Test patterns, view matches and groups, and learn regex syntax." />

      <Panel className="space-y-6">
        <div>
          <Label>
            Regular expression
          </Label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-shell border border-border-strong rounded-control font-mono text-fg-muted">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\\d+"
              className="flex-1 px-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
            <span className="flex items-center px-3 bg-shell border border-border-strong rounded-control font-mono text-fg-muted">
              /
            </span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gim"
              className="w-16 px-2 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
        </div>

        <div>
          <Label>
            Test string
          </Label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="> enter text to test against"
            className="w-full h-28 p-4 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        {result.error && (
          <ErrorBanner className="p-4 text-sm font-mono">
            {result.error}
          </ErrorBanner>
        )}

        {!result.error && (
          <>
            <div>
              <Label>
                Matches ({result.matches.length})
              </Label>
              {result.matches.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 bg-surface-muted border border-border rounded-control"
                    >
                      <div className="font-mono text-fg-soft">
                        {m[0]}
                      </div>
                      {m.length > 1 && (
                        <div className="mt-2 text-xs text-fg-muted space-y-1">
                          {m.slice(1).map((g, j) => (
                            <div key={j}>
                              Group {j + 1}: {g ?? "(undefined)"}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-fg-subtle mt-1">
                        index: {m.index}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-surface-muted border border-border rounded-control text-fg-muted text-center font-mono text-sm">
                  No matches
                </div>
              )}
            </div>

            {replaceWith !== "" && result.replace !== null && (
              <div>
                <Label>
                  Replace with
                </Label>
                <input
                  type="text"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="> replacement string"
                  className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg mb-2 rounded-control"
                />
                <div className="p-4 bg-surface-muted border border-border rounded-control font-mono text-sm whitespace-pre-wrap text-fg-soft">
                  {result.replace}
                </div>
              </div>
            )}

            {replaceWith === "" && (
              <div>
                <Label>
                  Replace (optional)
                </Label>
                <input
                  type="text"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="> leave empty to skip"
                  className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
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
            className="text-sm font-mono text-fg-muted hover:text-fg"
          >
            {showExplainer ? "Hide" : "Show"} regex syntax reference
          </button>
          {showExplainer && (
            <div className="mt-3 p-4 bg-surface-muted border border-border rounded-control overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-left text-fg-muted">
                    <th className="pb-2">Pattern</th>
                    <th className="pb-2 pl-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {TOKEN_GUIDE.map((t, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 text-fg-soft">
                        {t.pattern}
                      </td>
                      <td className="py-2 pl-4 text-fg-muted">
                        {t.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
