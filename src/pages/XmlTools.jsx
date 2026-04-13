import { useState, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { formatXml, minifyXml, parseXmlError } from "../utils/xmlFormat";

export default function XmlTools({ onToast }) {
  const [input, setInput] = useState(
    '<note><to>Tove</to><from>Jani</from><body>Don\'t forget!</body></note>',
  );
  const [output, setOutput] = useState("");
  const [err, setErr] = useState(null);

  const validateOnly = useCallback(() => {
    const e = parseXmlError(input);
    setErr(e);
    if (e) onToast?.("Invalid XML");
    else onToast?.("Well-formed XML");
  }, [input, onToast]);

  const runFormat = () => {
    setErr(null);
    try {
      setOutput(formatXml(input));
      onToast?.("Formatted");
    } catch (e) {
      setErr(e.message || "Error");
      setOutput("");
    }
  };

  const runMinify = () => {
    setErr(null);
    try {
      setOutput(minifyXml(input));
      onToast?.("Minified");
    } catch (e) {
      setErr(e.message || "Error");
      setOutput("");
    }
  };

  const copy = () =>
    output && copyToClipboard(output, () => onToast("Copied!"));

  const liveErr = parseXmlError(input);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          XML
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Format, minify, and check well-formed XML in the browser.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runFormat}
            className="px-4 py-2 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900"
          >
            Format
          </button>
          <button
            type="button"
            onClick={runMinify}
            className="px-4 py-2 font-mono text-xs border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={validateOnly}
            className="px-4 py-2 font-mono text-xs border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Validate only
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-4 border border-stone-300 dark:border-stone-700 font-mono text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />

        {(err || liveErr) && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-mono">
            {err || liveErr}
          </div>
        )}
        {!err && !liveErr && input.trim() && (
          <p className="text-xs font-mono text-green-700 dark:text-green-400">
            Well-formed (live check)
          </p>
        )}

        {output && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-[0.18em]">
                Output
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-[11px] font-mono underline text-stone-600 dark:text-stone-400"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all text-stone-800 dark:text-stone-200 max-h-80 overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
