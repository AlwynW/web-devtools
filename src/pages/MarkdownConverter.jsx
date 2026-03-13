import { useState, useCallback } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import CopyArea from "../components/CopyArea";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export default function MarkdownConverter({ onToast }) {
  const [mode, setMode] = useState("md2html");
  const [input, setInput] = useState("# Hello\n\n**Bold** and *italic* text.");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const convert = useCallback(async () => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (mode === "md2html") {
        const html = await marked.parse(input);
        setOutput(html);
      } else {
        setOutput(turndown.turndown(input));
      }
    } catch (e) {
      setError(e.message || "Conversion failed");
      setOutput("");
    }
  }, [input, mode]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Markdown Converter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Convert between Markdown and HTML.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max">
          <button
            onClick={() => setMode("md2html")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              mode === "md2html"
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Markdown → HTML
          </button>
          <button
            onClick={() => setMode("html2md")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              mode === "html2md"
                ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            HTML → Markdown
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Input ({mode === "md2html" ? "Markdown" : "HTML"})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={convert}
            placeholder={
              mode === "md2html"
                ? "# Heading\n\n**bold** *italic*"
                : "<h1>Heading</h1><p>Paragraph</p>"
            }
            className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <button
          onClick={convert}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Convert
        </button>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {output && (
          <>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Output ({mode === "md2html" ? "HTML" : "Markdown"})
            </label>
            {mode === "md2html" && (
              <div className="mb-2">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Preview
                </div>
                <div
                  className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_code]:bg-slate-100 [&_code]:dark:bg-slate-900 [&_code]:px-1 [&_code]:rounded [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:bg-slate-100 [&_pre]:dark:bg-slate-900 [&_a]:text-blue-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
            )}
            <CopyArea
              text={output}
              onCopySuccess={() =>
                onToast(
                  mode === "md2html" ? "HTML copied!" : "Markdown copied!",
                )
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
